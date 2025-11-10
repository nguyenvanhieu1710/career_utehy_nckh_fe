'use client'

import Button from "@/components/ui/Button";
import ChipTag from "@/components/ui/ChipTag";
import SearchBar from "@/components/ui/SearchBar";
import Select from "@/components/ui/Select";
import TextField from "@/components/ui/TextField";
import { useEffect, useState } from "react";

const products = [
    { id: "p1", thumbnailURL: "https://images.unsplash.com/photo-1606813908967-1ecb33d5a47e", title: "Nike Air Force 1" },
    { id: "p2", thumbnailURL: "https://images.unsplash.com/photo-1606813891349-bb9d1f3e5e11", title: "Adidas Ultraboost 22" },
    { id: "p3", thumbnailURL: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3c", title: "Puma RS-X" },
    { id: "p4", thumbnailURL: "https://images.unsplash.com/photo-1606813915678-7e8f3f9d1b0c", title: "Reebok Classic" },
    { id: "p5", thumbnailURL: "https://images.unsplash.com/photo-1606813923456-1c2d9b3e7f9f", title: "Converse Chuck Taylor" },
    { id: "p6", thumbnailURL: "https://images.unsplash.com/photo-1606813934567-3d9c8f0e5a1b", title: "Vans Old Skool" },
    { id: "p7", thumbnailURL: "https://images.unsplash.com/photo-1606813945678-6b7f4e1d2c3a", title: "New Balance 574" },
    { id: "p8", thumbnailURL: "https://images.unsplash.com/photo-1606813956789-4a5f1b2d6e7c", title: "Asics Gel-Kayano" },
    { id: "p9", thumbnailURL: "https://images.unsplash.com/photo-1606813967890-8e7c5b1a4f3d", title: "Jordan 1 Retro" },
    { id: "p10", thumbnailURL: "https://images.unsplash.com/photo-1606813978901-5f6d8c2b1e2f", title: "Under Armour Curry 8" },
];


export default function ExamplePage() {

    const [input, setInput] = useState("")
    const [selectValue, setSelectValue] = useState("")
    const [searchKey, setSearchKey] = useState("");
    const [productsData, setProductsData] = useState<any>([]);
    useEffect(() => {
        setProductsData(products.filter(p => p.title.toLowerCase().includes(searchKey.toLowerCase())))
    }, [searchKey])

    return (
        <>
            <Button value={"Click me"} />
            <label>Textfields</label>
            <div className="m-1 grid gap-1">
                <TextField placeholder="Bio..." onChange={(e) => setInput(e.target.value)} value={input} />
                <TextField placeholder="Bio..." error onChange={(e) => setInput(e.target.value)} value={input} />
                <TextField placeholder="Bio..." borderRadius={10} onChange={(e) => setInput(e.target.value)} value={input} />
            </div>
            <label>Selects</label>
            <div className="m-1 grid gap-1">
                <Select value={selectValue} onChange={e => setSelectValue(e.target.value)}>
                    {products.map((e, i) => {
                        return <option value={e.id}>{e.title}</option>
                    })}
                </Select>
            </div>
            <label>Chiptag</label>
            <div className="m-1 flex gap-1 flex-wrap">
                {productsData?.map((e, i) => {
                    return (<>
                        <ChipTag title={e.title} onClick={() => {
                            setSearchKey(e.title)
                        }} />
                    </>)
                })}
            </div>
            <SearchBar
                searchKeyword={searchKey}
                setSearchKeyword={(e) => setSearchKey(e)}
                showDropdown={false}
                toggleDropdown={() => { }}
                data={{
                    total: productsData?.length,
                    items: productsData?.map((e: any, i: number) => {
                        return {
                            title: e.title || `Product ${i + 1}`,
                            image: e.thumbnailURL || "",
                            id: e.id || i,
                        };
                    })

                }}
                renderItem={(item) => (
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <img style={{ width: "100px", height: "50px", borderRadius: "10px" }} src={item.image} /><b>{item.title}</b>
                    </div>
                )}
                onItemClick={(item) => {
                    setSearchKey(item.title)
                }}
            />
        </>
    )
}