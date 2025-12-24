"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import TextStyle from "@tiptap/extension-text-style";
import { Extension } from "@tiptap/core";
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6, Pilcrow } from "lucide-react";

const LineHeight = Extension.create({
    name: "lineHeight",

    addGlobalAttributes() {
        return [
            {
                types: ["paragraph", "heading"],
                attributes: {
                    lineHeight: {
                        default: null,
                        parseHTML: (element) => element.style.lineHeight || null,
                        renderHTML: (attributes) => {
                            const style = [];

                            if (attributes.lineHeight) {
                                style.push(`line-height: ${attributes.lineHeight}`);
                            }

                            return {
                                style: style.join("; "),
                            };
                        },
                    },
                },
            },
        ];
    },
});

const TipTapEditor = forwardRef(({ initialContent = "" }, ref) => {
    const [showHeadingDropdown, setShowHeadingDropdown] = useState(false);
    const [showLineHeightDropdown, setShowLineHeightDropdown] = useState(false);

    const editor = useEditor({
        extensions: [StarterKit, Underline, TextStyle, Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }), BulletList, OrderedList, TextAlign.configure({ types: ["heading", "paragraph"] }), LineHeight],
        content: initialContent,
    });

    useImperativeHandle(ref, () => ({
        getHTML: () => editor?.getHTML() || "",
    }));

    if (!editor) return null;

    return (
        <div className="card">
            {/* Toolbar */}
            <div className="card-header d-flex flex-wrap gap-2 align-items-center bg-primary text-white position-relative">
                {/* Dropdown for Headings */}
                <div className="dropdown">
                    <button type="button" className="btn btn-sm btn-light dropdown-toggle" onClick={() => setShowHeadingDropdown(!showHeadingDropdown)}>
                        Heading
                    </button>
                    {showHeadingDropdown && (
                        <div className="dropdown-menu show mt-2 shadow" style={{ position: "absolute", zIndex: 10 }}>
                            <button
                                className="dropdown-item d-flex align-items-center gap-2"
                                onClick={() => {
                                    editor.chain().focus().setParagraph().run();
                                    setShowHeadingDropdown(false);
                                }}
                            >
                                <Pilcrow size={16} /> Paragraph
                            </button>
                            <button
                                className="dropdown-item d-flex align-items-center gap-2"
                                onClick={() => {
                                    editor.chain().focus().toggleHeading({ level: 1 }).run();
                                    setShowHeadingDropdown(false);
                                }}
                            >
                                <Heading1 size={16} /> Heading 1
                            </button>
                            <button
                                className="dropdown-item d-flex align-items-center gap-2"
                                onClick={() => {
                                    editor.chain().focus().toggleHeading({ level: 2 }).run();
                                    setShowHeadingDropdown(false);
                                }}
                            >
                                <Heading2 size={16} /> Heading 2
                            </button>
                            <button
                                className="dropdown-item d-flex align-items-center gap-2"
                                onClick={() => {
                                    editor.chain().focus().toggleHeading({ level: 3 }).run();
                                    setShowHeadingDropdown(false);
                                }}
                            >
                                <Heading3 size={16} /> Heading 3
                            </button>
                            <button
                                className="dropdown-item d-flex align-items-center gap-2"
                                onClick={() => {
                                    editor.chain().focus().toggleHeading({ level: 4 }).run();
                                    setShowHeadingDropdown(false);
                                }}
                            >
                                <Heading4 size={16} /> Heading 4
                            </button>
                            <button
                                className="dropdown-item d-flex align-items-center gap-2"
                                onClick={() => {
                                    editor.chain().focus().toggleHeading({ level: 5 }).run();
                                    setShowHeadingDropdown(false);
                                }}
                            >
                                <Heading5 size={16} /> Heading 5
                            </button>
                            <button
                                className="dropdown-item d-flex align-items-center gap-2"
                                onClick={() => {
                                    editor.chain().focus().toggleHeading({ level: 6 }).run();
                                    setShowHeadingDropdown(false);
                                }}
                            >
                                <Heading6 size={16} /> Heading 6
                            </button>
                        </div>
                    )}
                </div>

                {/* Formatting Buttons */}
                <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive("bold") ? "btn btn-sm btn-dark" : "btn btn-sm btn-light"}>
                    <Bold size={16} />
                </button>
                <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive("italic") ? "btn btn-sm btn-dark" : "btn btn-sm btn-light"}>
                    <Italic size={16} />
                </button>
                <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive("underline") ? "btn btn-sm btn-dark" : "btn btn-sm btn-light"}>
                    <UnderlineIcon size={16} />
                </button>
                <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive("bulletList") ? "btn btn-sm btn-dark" : "btn btn-sm btn-light"}>
                    <List size={16} />
                </button>
                <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive("orderedList") ? "btn btn-sm btn-dark" : "btn btn-sm btn-light"}>
                    <ListOrdered size={16} />
                </button>
                <button type="button" onClick={() => editor.chain().focus().setTextAlign("left").run()} className="btn btn-sm btn-light">
                    <AlignLeft size={16} />
                </button>
                <button type="button" onClick={() => editor.chain().focus().setTextAlign("center").run()} className="btn btn-sm btn-light">
                    <AlignCenter size={16} />
                </button>
                <button type="button" onClick={() => editor.chain().focus().setTextAlign("right").run()} className="btn btn-sm btn-light">
                    <AlignRight size={16} />
                </button>
                <button type="button" onClick={() => editor.chain().focus().setHardBreak().run()} className="btn btn-sm btn-light">
                    Break
                </button>

                {/* Line Height Dropdown */}
                <div className="dropdown">
                    <button type="button" className="btn btn-sm btn-light dropdown-toggle" onClick={() => setShowLineHeightDropdown((prev) => !prev)}>
                        Line Height
                    </button>
                    {showLineHeightDropdown && (
                        <div className="dropdown-menu show mt-2 shadow" style={{ position: "absolute", zIndex: 10 }}>
                            {["1.2", "1.5", "1.8", "2.0"].map((value) => (
                                <button
                                    key={value}
                                    className="dropdown-item"
                                    onClick={() => {
                                        editor
                                            .chain()
                                            .focus()
                                            .updateAttributes("paragraph", {
                                                lineHeight: value,
                                            })
                                            .updateAttributes("heading", {
                                                lineHeight: value,
                                            })
                                            .run();
                                        setShowLineHeightDropdown(false);
                                    }}
                                >
                                    {value}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Editor */}
            <div className="card-body border rounded p-2 min-h-[150px]">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
});

export default TipTapEditor;
