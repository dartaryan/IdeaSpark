// src/features/prototypes/components/FileTree.tsx

import { useState, useCallback } from 'react';
import { ChevronRight, ChevronDown, FileCode, FileText, FileType } from 'lucide-react';
import type { FileTreeProps, FileTreeNode as FileTreeNodeType } from '../types';
import { buildFileTree } from '../types';

/** Get icon for file type */
function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'tsx':
    case 'ts':
    case 'jsx':
    case 'js':
      return <FileCode className="w-4 h-4 text-blue-400" />;
    case 'css':
      return <FileType className="w-4 h-4 text-purple-400" />;
    case 'html':
      return <FileText className="w-4 h-4 text-orange-400" />;
    case 'json':
      return <FileText className="w-4 h-4 text-yellow-400" />;
    default:
      return <FileText className="w-4 h-4 text-base-content/50" />;
  }
}

/** Render a single file tree node (recursive for directories) */
function FileTreeItem({
  node,
  activeFile,
  onFileSelect,
  level = 0,
}: {
  node: FileTreeNodeType;
  activeFile: string;
  onFileSelect: (path: string) => void;
  level?: number;
}) {
  const [isOpen, setIsOpen] = useState(node.isOpen ?? true);

  const handleClick = useCallback(() => {
    if (node.type === 'directory') {
      setIsOpen((prev) => !prev);
    } else {
      onFileSelect(node.path);
    }
  }, [node, onFileSelect]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
      if (node.type === 'directory') {
        if (e.key === 'ArrowRight' && !isOpen) {
          e.preventDefault();
          setIsOpen(true);
        }
        if (e.key === 'ArrowLeft' && isOpen) {
          e.preventDefault();
          setIsOpen(false);
        }
      }
    },
    [handleClick, node.type, isOpen],
  );

  const isActive = node.type === 'file' && node.path === activeFile;

  return (
    <li role="treeitem" aria-expanded={node.type === 'directory' ? isOpen : undefined}>
      <button
        className={`
          flex items-center gap-1.5 w-full text-left px-2 py-1 text-sm rounded-md
          transition-colors duration-100 cursor-pointer
          ${isActive ? 'bg-primary/15 text-primary font-medium' : 'hover:bg-base-300/50 text-base-content/80'}
        `}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={`${node.type === 'directory' ? 'Directory' : 'File'}: ${node.name}`}
        aria-selected={isActive}
        tabIndex={0}
      >
        {node.type === 'directory' ? (
          <>
            {isOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-base-content/50 shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-base-content/50 shrink-0" />
            )}
            <span className="truncate">{node.name}</span>
          </>
        ) : (
          <>
            <span className="w-3.5 shrink-0" /> {/* Spacer to align with dir arrows */}
            {getFileIcon(node.name)}
            <span className="truncate">{node.name}</span>
          </>
        )}
      </button>

      {node.type === 'directory' && isOpen && node.children && (
        <ul role="group" className="list-none">
          {node.children.map((child) => (
            <FileTreeItem
              key={child.path}
              node={child}
              activeFile={activeFile}
              onFileSelect={onFileSelect}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

/** File tree component for navigating multi-file prototypes */
export function FileTree({ files, activeFile, onFileSelect }: FileTreeProps) {
  const tree = buildFileTree(files);

  if (tree.length === 0) {
    return (
      <div className="p-3 text-sm text-base-content/50 italic">
        No files available
      </div>
    );
  }

  return (
    <nav aria-label="File explorer">
      <ul role="tree" className="list-none py-1">
        {tree.map((node) => (
          <FileTreeItem
            key={node.path}
            node={node}
            activeFile={activeFile}
            onFileSelect={onFileSelect}
          />
        ))}
      </ul>
    </nav>
  );
}
