"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Button from "@/components/ui/Button";
import { Label } from "@/components/ui/label";

import ChipTag from "../ui/ChipTag";
import TextField from "../ui/TextField";

import { ArrowUpIcon, ArrowDownIcon, Plus } from "lucide-react";

interface AddRoleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;

    initialData?: {
        name?: string;
        description?: string;
        permissions?: {
            id: string,
            group_id: string,
            perm: string
        }[];   
    };

    permissions: string[];         // danh sách quyền gợi ý

    mode?: "add" | "edit";
    onSubmit?: (data: {
        name: string;
        description?: string;
        perms: string[];
    }) => void;
}

export const RoleDialog = ({
    open,
    onOpenChange,
    initialData,
    permissions,
    mode = "add",
    onSubmit,
}: AddRoleDialogProps) => {

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
    const [permsManually, setPermsManually] = useState("");

    // Reset when open
    useEffect(() => {
        if (open) {
            setName(initialData?.name ?? "");
            setDescription(initialData?.description ?? "");
            setSelectedPerms(initialData?.permissions?.map((e)=>e.perm) || [])
        }
    }, [open, initialData]);


    // Toggle chọn/bỏ chọn perm
    const togglePerm = (perm: string) => {
        setSelectedPerms(prev =>
            prev.includes(perm)
                ? prev.filter(p => p !== perm)
                : [...prev, perm]
        );
    };

    // Thêm perm từ nhập text
    const handleAddManualPerms = () => {
        const lines = permsManually
            .split("\n")
            .map(l => l.trim())
            .filter(l => l !== "");

        if (!lines.length) return;

        setSelectedPerms(prev => [...prev, ...lines]);
        setPermsManually("");
    };

    const handleSubmit = () => {
        if (!name.trim()) return;
        onSubmit?.({
            name,
            description,
            perms: selectedPerms,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-white text-gray-800">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "add" ? "Thêm nhóm quyền" : "Chỉnh sửa nhóm quyền"}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Name */}
                    <div className="flex flex-col gap-4">
                        <Label className="text-right">Tên nhóm</Label>
                        <TextField
                            placeholder="Nhập tên nhóm quyền"
                            borderRadius={10}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    {/* Description */}
                    <div className="flex flex-col items-start gap-4">
                        <Label className="text-right pt-2">Mô tả</Label>
                        <TextField
                            mutiline
                            placeholder="Mô tả vai trò"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            borderRadius={10}
                        />
                    </div>

                    {/* Permissions Section */}
                    <div>
                        <Label className="font-semibold">Danh sách quyền</Label>

                        {/* Selected permissions */}
                        <div className="flex flex-col gap-3 mt-3 w-full">

                            <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-gray-100">
                                {selectedPerms.map((perm, idx) => (
                                    <ChipTag
                                        key={idx}
                                        title={perm}
                                        color="#ceffe6ff"
                                        backgroundColor="#24a46bff"
                                        onClick={() => togglePerm(perm)}
                                    />
                                ))}
                                {selectedPerms.length === 0 && (
                                    <span className="text-sm text-gray-500 italic">
                                        Chưa có quyền nào được chọn
                                    </span>
                                )}
                            </div>

                            <div className="flex justify-center gap-5 text-gray-600">
                                <ArrowUpIcon />
                                <ArrowDownIcon />
                            </div>

                            <div className="flex gap-3 relative">
                                <TextField
                                    mutiline
                                    placeholder={`Enter the permission name manually\n\nblog.*\nuser.update\nuser.*\n...`}
                                    value={permsManually}
                                    onChange={(e: any) => setPermsManually(e.target.value)}
                                    borderRadius={5}
                                />
                                <div className="absolute top-2 right-3">
                                    <Button onClick={handleAddManualPerms} iconLeft={<Plus size={16} />} />
                                </div>
                            </div>

                            {/* Suggestion permissions */}
                            <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-gray-100">
                                {permissions.map((perm, idx) => {
                                    const added = selectedPerms.includes(perm);
                                    if (added) return null;

                                    return (
                                        <ChipTag
                                            key={idx}
                                            title={perm}
                                            color="#ffd1d1ff"
                                            backgroundColor="#bb433cff"
                                            onClick={() => togglePerm(perm)}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button value={mode === "add" ? "Thêm" : "Lưu"} onClick={handleSubmit} />
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
