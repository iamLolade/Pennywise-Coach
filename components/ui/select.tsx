"use client";

import * as React from "react";
import SelectComponent, { StylesConfig, GroupBase } from "react-select";

import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  isDisabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
}

/**
 * Styled Select component using react-select
 * Matches design system with semantic tokens
 */
export function Select({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  isDisabled = false,
  className,
  id,
  name,
  required = false,
}: SelectProps) {
  const selectedOption = options.find((opt) => opt.value === value);

  const handleChange = (selected: SelectOption | null) => {
    if (onChange && selected) {
      onChange(selected.value);
    }
  };

  // Custom styles matching design system - using hex colors directly
  const customStyles: StylesConfig<SelectOption, false, GroupBase<SelectOption>> = {
    control: (base, state) => ({
      ...base,
      minHeight: "44px",
      height: "44px",
      borderColor: state.isFocused ? "#4A90E2" : "#E0E0E0",
      backgroundColor: "#FFFFFF",
      boxShadow: state.isFocused
        ? "0 0 0 2px rgba(74, 144, 226, 0.5)"
        : "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      "&:hover": {
        borderColor: state.isFocused ? "#4A90E2" : "#E0E0E0",
      },
      borderRadius: "0.625rem",
      cursor: isDisabled ? "not-allowed" : "pointer",
      paddingLeft: "0.75rem",
      paddingRight: "0.5rem",
    }),
    valueContainer: (base) => ({
      ...base,
      padding: "0",
      height: "100%",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#6B7280",
      fontSize: "0.875rem",
      margin: "0",
    }),
    singleValue: (base) => ({
      ...base,
      color: "#1A1A1A",
      fontSize: "0.875rem",
      margin: "0",
    }),
    input: (base) => ({
      ...base,
      color: "#1A1A1A",
      fontSize: "0.875rem",
      margin: "0",
      padding: "0",
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "#FFFFFF",
      border: "1px solid #E0E0E0",
      borderRadius: "0.625rem",
      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      marginTop: "0.25rem",
      zIndex: 50,
      overflow: "hidden",
    }),
    menuList: (base) => ({
      ...base,
      padding: "0.25rem",
      maxHeight: "300px",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#4A90E2"
        : state.isFocused
          ? "#F5F5F5"
          : "transparent",
      color: state.isSelected
        ? "#FFFFFF"
        : "#1A1A1A",
      fontSize: "0.875rem",
      padding: "0.625rem 0.75rem",
      borderRadius: "0.375rem",
      cursor: "pointer",
      margin: "0.125rem",
      transition: "background-color 0.15s ease, color 0.15s ease",
      "&:active": {
        backgroundColor: state.isSelected
          ? "#4A90E2"
          : "#F5F5F5",
      },
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    dropdownIndicator: (base, state) => ({
      ...base,
      color: "#6B7280",
      padding: "0.5rem",
      transition: "transform 0.2s ease, color 0.15s ease",
      transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : "rotate(0deg)",
      "&:hover": {
        color: "#1A1A1A",
      },
    }),
    clearIndicator: (base) => ({
      ...base,
      color: "#6B7280",
      padding: "0.5rem",
      "&:hover": {
        color: "#1A1A1A",
      },
    }),
  };

  return (
    <div className={cn("w-full", className)}>
      <SelectComponent
        id={id}
        name={name}
        options={options}
        value={selectedOption}
        onChange={handleChange}
        placeholder={placeholder}
        isDisabled={isDisabled}
        isSearchable={false}
        styles={customStyles}
        required={required}
        classNamePrefix="react-select"
        aria-label={name || id || "Select option"}
      />
    </div>
  );
}
