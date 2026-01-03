/**
 * useDiffParser Hook Tests
 *
 * @module hooks/__tests__/useDiffParser.test
 * @author ECO-Lambda | DFO 4.0 Epic 3 Sprint 3.2
 * @date 2026-01-02
 * @task DFO-202-EPIC21
 */

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDiffParser } from '../useDiffParser';

describe('useDiffParser', () => {
  describe('Empty and invalid inputs', () => {
    it('should return empty result for empty string', () => {
      const { result } = renderHook(() => useDiffParser(''));

      expect(result.current).toEqual({
        oldFileName: null,
        newFileName: null,
        hunks: [],
        totalAdditions: 0,
        totalDeletions: 0,
        language: null,
      });
    });

    it('should return empty result for whitespace-only string', () => {
      const { result } = renderHook(() => useDiffParser('   \n  \t  '));

      expect(result.current).toEqual({
        oldFileName: null,
        newFileName: null,
        hunks: [],
        totalAdditions: 0,
        totalDeletions: 0,
        language: null,
      });
    });
  });

  describe('Valid unified diff parsing', () => {
    it('should parse simple unified diff correctly', () => {
      const diff = `diff --git a/test.js b/test.js
index 1234567..abcdefg 100644
--- a/test.js
+++ b/test.js
@@ -1,3 +1,4 @@
 function hello() {
-  console.log('old');
+  console.log('new');
+  return true;
 }`;

      const { result } = renderHook(() => useDiffParser(diff));

      expect(result.current.oldFileName).toBe('test.js');
      expect(result.current.newFileName).toBe('test.js');
      expect(result.current.hunks).toHaveLength(1);
      expect(result.current.totalAdditions).toBe(2);
      expect(result.current.totalDeletions).toBe(1);
      expect(result.current.language).toBe('javascript');
    });

    it('should parse multiple hunks correctly', () => {
      const diff = `diff --git a/file.ts b/file.ts
--- a/file.ts
+++ b/file.ts
@@ -1,2 +1,2 @@
-old line 1
+new line 1
 unchanged line
@@ -10,2 +10,2 @@
-old line 2
+new line 2
 unchanged line 2`;

      const { result } = renderHook(() => useDiffParser(diff));

      expect(result.current.hunks).toHaveLength(2);
      expect(result.current.hunks[0].id).toBe('hunk-0');
      expect(result.current.hunks[1].id).toBe('hunk-1');
    });

    it('should track line numbers correctly', () => {
      const diff = `diff --git a/test.py b/test.py
--- a/test.py
+++ b/test.py
@@ -5,4 +5,5 @@
 def hello():
-    print("old")
+    print("new")
+    return True
 # end`;

      const { result } = renderHook(() => useDiffParser(diff));

      const hunk = result.current.hunks[0];
      expect(hunk.oldStart).toBe(5);
      expect(hunk.newStart).toBe(5);

      // Check line types
      const lines = hunk.lines;
      expect(lines[0].type).toBe('unchanged'); // def hello():
      expect(lines[1].type).toBe('deleted');   // print("old")
      expect(lines[2].type).toBe('added');     // print("new")
      expect(lines[3].type).toBe('added');     // return True
      expect(lines[4].type).toBe('unchanged'); // # end
    });

    it('should correctly count additions and deletions', () => {
      const diff = `diff --git a/file.txt b/file.txt
--- a/file.txt
+++ b/file.txt
@@ -1,5 +1,3 @@
-deleted line 1
-deleted line 2
 kept line
+added line 1
-deleted line 3
 kept line 2`;

      const { result } = renderHook(() => useDiffParser(diff));

      expect(result.current.totalAdditions).toBe(1);
      expect(result.current.totalDeletions).toBe(3);
    });
  });

  describe('Language detection', () => {
    const languages = [
      { ext: 'js', expected: 'javascript' },
      { ext: 'jsx', expected: 'javascript' },
      { ext: 'ts', expected: 'typescript' },
      { ext: 'tsx', expected: 'typescript' },
      { ext: 'py', expected: 'python' },
      { ext: 'java', expected: 'java' },
      { ext: 'cpp', expected: 'cpp' },
      { ext: 'c', expected: 'c' },
      { ext: 'cs', expected: 'csharp' },
      { ext: 'go', expected: 'go' },
      { ext: 'rs', expected: 'rust' },
      { ext: 'php', expected: 'php' },
      { ext: 'rb', expected: 'ruby' },
      { ext: 'css', expected: 'css' },
      { ext: 'scss', expected: 'scss' },
      { ext: 'json', expected: 'json' },
      { ext: 'md', expected: 'markdown' },
      { ext: 'sql', expected: 'sql' },
      { ext: 'sh', expected: 'bash' },
      { ext: 'yml', expected: 'yaml' },
      { ext: 'yaml', expected: 'yaml' },
    ];

    languages.forEach(({ ext, expected }) => {
      it(`should detect ${expected} from .${ext} extension`, () => {
        const diff = `diff --git a/test.${ext} b/test.${ext}
--- a/test.${ext}
+++ b/test.${ext}
@@ -1 +1 @@
-old
+new`;

        const { result } = renderHook(() => useDiffParser(diff));
        expect(result.current.language).toBe(expected);
      });
    });

    it('should return null for unknown extensions', () => {
      const diff = `diff --git a/test.xyz b/test.xyz
--- a/test.xyz
+++ b/test.xyz
@@ -1 +1 @@
-old
+new`;

      const { result } = renderHook(() => useDiffParser(diff));
      expect(result.current.language).toBeNull();
    });

    it('should return null when no filename available', () => {
      const diff = `diff --git a/ b/
--- a/
+++ b/
@@ -1 +1 @@
-old
+new`;

      const { result } = renderHook(() => useDiffParser(diff));
      expect(result.current.language).toBeNull();
    });
  });

  describe('DiffLine structure', () => {
    it('should create correct DiffLine objects for added lines', () => {
      const diff = `diff --git a/test.txt b/test.txt
--- a/test.txt
+++ b/test.txt
@@ -1,1 +1,2 @@
 unchanged
+added line`;

      const { result } = renderHook(() => useDiffParser(diff));

      const addedLine = result.current.hunks[0].lines[1];
      expect(addedLine.type).toBe('added');
      expect(addedLine.content).toBe('added line');
      expect(addedLine.oldLineNumber).toBeNull();
      expect(addedLine.newLineNumber).toBe(2);
      expect(addedLine.lineNumber).toBe(2);
    });

    it('should create correct DiffLine objects for deleted lines', () => {
      const diff = `diff --git a/test.txt b/test.txt
--- a/test.txt
+++ b/test.txt
@@ -1,2 +1,1 @@
 unchanged
-deleted line`;

      const { result } = renderHook(() => useDiffParser(diff));

      const deletedLine = result.current.hunks[0].lines[1];
      expect(deletedLine.type).toBe('deleted');
      expect(deletedLine.content).toBe('deleted line');
      expect(deletedLine.oldLineNumber).toBe(2);
      expect(deletedLine.newLineNumber).toBeNull();
      expect(deletedLine.lineNumber).toBe(2);
    });

    it('should create correct DiffLine objects for unchanged lines', () => {
      const diff = `diff --git a/test.txt b/test.txt
--- a/test.txt
+++ b/test.txt
@@ -1,1 +1,1 @@
 unchanged line`;

      const { result } = renderHook(() => useDiffParser(diff));

      const unchangedLine = result.current.hunks[0].lines[0];
      expect(unchangedLine.type).toBe('unchanged');
      expect(unchangedLine.content).toBe('unchanged line');
      expect(unchangedLine.oldLineNumber).toBe(1);
      expect(unchangedLine.newLineNumber).toBe(1);
      expect(unchangedLine.lineNumber).toBe(1);
    });
  });

  describe('DiffHunk structure', () => {
    it('should create hunk with correct header', () => {
      const diff = `diff --git a/test.txt b/test.txt
--- a/test.txt
+++ b/test.txt
@@ -10,5 +15,8 @@ context
 line 1
+added
 line 2`;

      const { result } = renderHook(() => useDiffParser(diff));

      const hunk = result.current.hunks[0];
      expect(hunk.header).toBe('@@ -10,5 +15,8 @@');
      expect(hunk.oldStart).toBe(10);
      expect(hunk.oldLines).toBe(5);
      expect(hunk.newStart).toBe(15);
      expect(hunk.newLines).toBe(8);
    });
  });

  describe('Memoization', () => {
    it('should return same object reference for same input', () => {
      const diff = `diff --git a/test.js b/test.js
--- a/test.js
+++ b/test.js
@@ -1 +1 @@
-old
+new`;

      const { result, rerender } = renderHook(
        ({ diffString }) => useDiffParser(diffString),
        { initialProps: { diffString: diff } }
      );

      const firstResult = result.current;

      rerender({ diffString: diff });

      expect(result.current).toBe(firstResult);
    });

    it('should return new object reference for different input', () => {
      const diff1 = `diff --git a/test.js b/test.js
--- a/test.js
+++ b/test.js
@@ -1 +1 @@
-old
+new`;

      const diff2 = `diff --git a/other.js b/other.js
--- a/other.js
+++ b/other.js
@@ -1 +1 @@
-different
+content`;

      const { result, rerender } = renderHook(
        ({ diffString }) => useDiffParser(diffString),
        { initialProps: { diffString: diff1 } }
      );

      const firstResult = result.current;

      rerender({ diffString: diff2 });

      expect(result.current).not.toBe(firstResult);
    });
  });
});
