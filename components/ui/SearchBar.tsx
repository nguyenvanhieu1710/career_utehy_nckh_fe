import React, { useState } from "react";
import TextField from "./TextField";
import './ui.css'
interface SearchBarProps<T> {
    searchKeyword: string;
    setSearchKeyword: (value: string) => void;
    showDropdown: boolean;
    toggleDropdown: (show: boolean) => void;
    data: { total: number; items: T[] };
    newData?: { items: T[] };
    error?: boolean;
    renderItem: (item: T) => React.ReactNode;
    onItemClick: (item: T) => void;
}

function SearchBar<T>({
    searchKeyword,
    setSearchKeyword,
    showDropdown,
    toggleDropdown,
    data,
    newData,
    error,
    renderItem,
    onItemClick,
}: SearchBarProps<T>) {
    const [showDropbox, toggleDropbox] = useState(showDropdown)
    return (
        <div style={{ position: "relative" }}>
            <TextField
                onClick={(e) => {
                    e.stopPropagation();
                }}
                flex={1}
                onFocus={() => toggleDropbox(true)}
                placeholder="Search..."
                borderRadius={3}
                value={searchKeyword}
                error={error}
                onChange={(e) => {
                    setSearchKeyword(e.target.value);
                }}
                iconRight={<span className="pi pi-chevron-down"></span>}
            />

            <div
                className={`searchbar-dropdown ${showDropbox ? "show" : "hide"}`}
            >
                <p className="search-result-title">
                    Search results for '{searchKeyword}' - total: {data?.total}
                </p>

                {data?.items?.map((item, idx) => (
                    <div
                        key={idx}
                        className="searchbar-item"
                        onClick={() => { onItemClick(item); toggleDropbox(false) }}
                    >
                        {renderItem(item)}
                    </div>
                ))}

                {newData && (
                    <>
                        <div className="searchbar-new-header">-- new items --</div>
                        {newData.items?.map((item, idx) => (
                            <div
                                key={`new-${idx}`}
                                className="searchbar-item"
                                onClick={() => onItemClick(item)}
                            >
                                {renderItem(item)}
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}

export default SearchBar;
