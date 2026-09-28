import React from "react";
import { Link } from "react-router-dom";
import "./Breadcrumb.css";

/**
 * Breadcrumb — universal navigation element with one or more parent links.
 *
 * Renders as a horizontal chain separated by " / ". Each item is a
 * react-router Link. If only one item is passed, the separator is omitted.
 *
 * Usage:
 *   <Breadcrumb items={[
 *     { label: "CheatSheet", to: "/cheatsheet" },
 *     { label: "C Sharp", to: "/cheatsheet/category/c-sharp" },
 *   ]} />
 *
 * Renders: ← CheatSheet / C Sharp
 *
 * @component
 * @param {object} props
 * @param {Array<{ label: string, to: string }>} props.items - Parent chain.
 * @returns {JSX.Element | null}
 */
export function Breadcrumb({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <span className="breadcrumb-arrow">←</span>
      {items.map((item, index) => (
        <React.Fragment key={item.to}>
          <Link to={item.to} className="breadcrumb-link">
            {item.label}
          </Link>
          {index < items.length - 1 && (
            <span className="breadcrumb-separator">/</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
