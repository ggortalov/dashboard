import { useState } from 'react';
import './SectionTree.css';

function TreeNode({ section, childrenMap, selectedId, onSelect, onAdd, onEdit, onDelete, level = 0 }) {
  const [expanded, setExpanded] = useState(true);
  const children = childrenMap[section.id] || [];
  const hasChildren = children.length > 0;
  const isSelected = selectedId === section.id;

  return (
    <div className="tree-node">
      <div
        className={`tree-node-row ${isSelected ? 'selected' : ''}`}
        style={{ paddingLeft: `${12 + level * 16}px` }}
        onClick={() => onSelect(section.id)}
      >
        <span
          className={`tree-toggle ${hasChildren ? 'has-children' : ''}`}
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
        >
          {hasChildren ? (expanded ? '\u25BC' : '\u25B6') : '\u00B7'}
        </span>
        <span className="tree-node-name">{section.name}</span>
        <span className="tree-node-count">{section.case_count || 0}</span>
        <div className="tree-node-actions">
          <button title="Add child" onClick={(e) => { e.stopPropagation(); onAdd(section.id); }}>+</button>
          <button title="Edit" onClick={(e) => { e.stopPropagation(); onEdit(section); }}>&#9998;</button>
          <button title="Delete" onClick={(e) => { e.stopPropagation(); onDelete(section); }}>&times;</button>
        </div>
      </div>
      {expanded && hasChildren && (
        <div className="tree-children">
          {children.map((child) => (
            <TreeNode
              key={child.id}
              section={child}
              childrenMap={childrenMap}
              selectedId={selectedId}
              onSelect={onSelect}
              onAdd={onAdd}
              onEdit={onEdit}
              onDelete={onDelete}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SectionTree({ sections, selectedId, onSelect, onAdd, onEdit, onDelete }) {
  // Build tree from flat list
  const childrenMap = {};
  const roots = [];

  sections.forEach((s) => {
    if (!childrenMap[s.parent_id]) childrenMap[s.parent_id] = [];
  });

  sections.forEach((s) => {
    if (s.parent_id === null || s.parent_id === undefined) {
      roots.push(s);
    } else {
      if (!childrenMap[s.parent_id]) childrenMap[s.parent_id] = [];
      childrenMap[s.parent_id].push(s);
    }
  });

  return (
    <div className="section-tree">
      {roots.map((section) => (
        <TreeNode
          key={section.id}
          section={section}
          childrenMap={childrenMap}
          selectedId={selectedId}
          onSelect={onSelect}
          onAdd={onAdd}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
      {roots.length === 0 && (
        <div className="tree-empty">No sections yet</div>
      )}
    </div>
  );
}
