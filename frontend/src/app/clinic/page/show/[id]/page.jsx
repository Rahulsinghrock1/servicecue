"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import MainConfig from "@/mainconfig";
import dynamic from "next/dynamic";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";

// ✅ Correct dynamic import
const CKEditor = dynamic(
  () => import("@ckeditor/ckeditor5-react").then((mod) => mod.CKEditor),
  { ssr: false }
);
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

export default function Page() {
  const { id } = useParams(); // e.g. about-app
  const API_BASE_URL = MainConfig.API_BASE_URL;

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ✅ Fetch Page Details
  useEffect(() => {
    if (!id) return;
    const fetchPageDetail = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/Pages/${id}`);
        setContent(res.data.data?.content || "");
      } catch (error) {
        console.error("Error fetching page detail:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPageDetail();
  }, [id, API_BASE_URL]);

  // ✅ Save / Update Page API
  const handleSave = async () => {
    try {
      setSaving(true);
      await axios.put(`${API_BASE_URL}/page/update/${id}`, {
        content: content,
      });
              toast.success("Page updated successfully!");
    } catch (error) {
      console.error("Error updating page:", error);
      alert("❌ Failed to update page");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div className="page-inner">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-3">Page Content</h2>
          <CKEditor
            editor={ClassicEditor}
            data={content}
            onChange={(event, editor) => {
              setContent(editor.getData());
            }}
          />
          <button
            onClick={handleSave}
            className="btn btn-primary mt-3"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
