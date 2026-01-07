let authToken: string | null = null;

async function dashboardLogin(): Promise<boolean> {
  const DASHBOARD_API_URL = process.env.DASHBOARD_API_URL || 'http://office:3030/api';
  const username = process.env.DASHBOARD_USER || 'carlosjperez';
  const password = process.env.DASHBOARD_PASS || 'bypass';

  try {
    const response = await fetch(`${DASHBOARD_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      console.error(`Dashboard login error: ${response.status}`);
      return false;
    }

    const data: any = await response.json();
    authToken = data.token;
    console.log('[MCP] Dashboard login successful');
    return true;
  } catch (error) {
    console.error(`Dashboard login error: ${error}`);
    return false;
  }
}

async function dashboardRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
  const DASHBOARD_API_URL = process.env.DASHBOARD_API_URL || 'http://office:3030/api';

  if (!authToken) {
    const loggedIn = await dashboardLogin();
    if (!loggedIn) return null;
  }

  try {
    const url = `${DASHBOARD_API_URL}/${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        ...options.headers
      }
    });

    if (!response.ok) {
      console.error(`Dashboard API error: ${response.status} ${url}`);
      if (response.status === 401 || response.status === 403) {
        authToken = null;
        return null;
      }
      return null;
    }

    const data: any = await response.json();
    return data as T;
  } catch (error) {
    console.error(`Dashboard API fetch error: ${error}`);
    return null;
  }
}

export async function getProjects() {
  const response = await dashboardRequest<any>('projects', { method: 'GET' });
  return response?.projects || (response as any) || [];
}

export async function getTasks(projectId: number) {
  const response = await dashboardRequest<any>(`tasks?project_id=${projectId}`, { method: 'GET' });
  return response?.tasks || response || [];
}

export async function getAgents() {
  const response = await dashboardRequest<any>('agents', { method: 'GET' });
  return response?.agents || response || [];
}

export async function getHealth() {
  const response = await dashboardRequest<any>('health', { method: 'GET' });
  return response || null;
}

export async function createProject(name: string, options: any = {}) {
  return await dashboardRequest('projects', {
    method: 'POST',
    body: JSON.stringify({ name, ...options })
  });
}

export async function createTask(projectId: number, title: string, options: any = {}) {
  return await dashboardRequest('tasks', {
    method: 'POST',
    body: JSON.stringify({ project_id: projectId, title, ...options })
  });
}

export async function updateTaskStatus(taskId: number, status: string) {
  return await dashboardRequest(`tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });
}

export async function createMemory(content: string, tags: string[]) {
  return await dashboardRequest('memories', {
    method: 'POST',
    body: JSON.stringify({ content, tags })
  });
}
