import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";
import axios from "axios";
import { Form, Button, Badge, Dropdown } from "react-bootstrap";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { ParagraphNode, $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND, FORMAT_ELEMENT_COMMAND } from "lexical";
import ImagePlugin, { INSERT_IMAGE_COMMAND } from "../components/ImagePlugin";
import { $patchStyleText } from "@lexical/selection";
import { ImageNode } from "../js/ImageNode";
import "../css/Editor.css"; // CSS 임포트

// --- API 주소 설정 ---
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080"; 
const UP_API_URL = `${BASE_URL}/api/upload-image`;
// const DEL_API_URL = `${BASE_URL}/api/delete-image`; // 삭제 기능이 없으므로 주석 처리 또는 삭제
const ARTICLES_API_URL = "http://localhost:3000/articles"; // json-server 주소 (필요시 수정)

function ArticleForm({ isEdit = false }) {
  const { artworkId, id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [images, setImages] = useState([]); // 저장 시점에 포함된 이미지 목록을 추적
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [isLoaded, setIsLoaded] = useState(!isEdit);
  const contentRef = useRef(null); // Lexical 에디터의 JSON 상태를 저장
  const toolbarFileInputRef = useRef(null);
  
  const initialEditorState = JSON.stringify({
    root: {
      children: [{ type: "paragraph", children: [], version: 1 }],
      type: "root",
      version: 1,
    },
  });

  useEffect(() => {
    if (isEdit && id) {
      //기사 추출
      axios.get(`${ARTICLES_API_URL}/${id}`).then((res) => {
          setTitle(res.data.title || "");

          try {
            JSON.parse(res.data.content);
            contentRef.current = res.data.content;
          } catch (e) {
            contentRef.current = initialEditorState;
          }

          setImages(res.data.images || []);
          setTags(res.data.tags || []);
          setIsLoaded(true);
        }).catch((error) => {
          console.error("Failed to load article:", error);
          contentRef.current = initialEditorState;
          setIsLoaded(true);
          alert("기사를 불러오지 못했습니다. 빈 에디터로 시작합니다.");
        });
    } else {
      contentRef.current = initialEditorState;
      setIsLoaded(true);
    }
  }, [isEdit, id, initialEditorState]);

  const compressImage = async (file) => {
    const options = { maxSizeMB: 1, maxWidthOrHeight: 1024 };
    return await imageCompression(file, options);
  };

  const handleImageUpload = async (e, editor) => {
      try {
          const files = Array.from(e.target.files);
          if (!files.length) return;

          const imageFiles = files.filter((f) => f.type.startsWith("image/"));
          if (imageFiles.length !== files.length) {
              alert("이미지 파일만 업로드 가능합니다.");
          }
          if (!imageFiles.length) return;

          // 여러 파일을 한 번에 처리하기 위해 Promise.all 사용
          await Promise.all(
              imageFiles.map(async (originalFile) => { // 원본 파일을 기준으로 매핑
                  try {
                      // 1. 이미지를 압축합니다.
                      const compressedFile = await compressImage(originalFile);

                      const formData = new FormData();

                      // 2. THE FIX: formData.append의 세 번째 인자로 '원본 파일의 이름'을 명시적으로 전달합니다.
                      // 이렇게 하면 압축 과정에서 파일 이름이 유실되더라도 올바른 이름과 확장자로 서버에 전송됩니다.
                      formData.append("file", compressedFile, originalFile.name);

                      // 3. 서버에 업로드 요청을 보냅니다.
                      const res = await axios.post(UP_API_URL, formData, {
                          headers: { "Content-Type": "multipart/form-data" },
                      });

                      const { imageUrl } = res.data;
                      if (imageUrl) {
                          const newImage = {
                              name: imageUrl.split("/").pop(),
                              url: imageUrl,
                          };
                          setImages((prev) => [...prev, newImage]);
                          editor.dispatchCommand(INSERT_IMAGE_COMMAND, newImage.url);
                      }
                  } catch (uploadError) {
                      console.error(`'${originalFile.name}' 파일 업로드 실패:`, uploadError);
                      // 개별 파일 실패 시 사용자에게 알릴 수 있습니다.
                  }
              })
          );

      } catch (error) {
          console.error("Image upload process failed:", error);
          alert("이미지 처리 중 오류가 발생했습니다.");
      } finally {
          // 모든 작업이 끝난 후 파일 입력 필드를 초기화합니다.
          e.target.value = null;
      }
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tag) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSave = async () => {
    try {
      if (!title.trim()) {
        alert("제목을 입력하세요.");
        return;
      }
      if (!contentRef.current) {
        alert("내용을 입력하세요.");
        return;
      }
      const data = {
        title,
        content: contentRef.current,
        images, // 최종적으로 포함된 이미지 정보 배열
        tags,
        artworkId,
        updatedAt: new Date().toISOString(),
      };

      if (isEdit && id) {
        await axios.put(`${ARTICLES_API_URL}/${id}`, data);
        alert("수정 완료");
        navigate(`/article/${id}`);
      } else {
        data.createdAt = new Date().toISOString();
        const res = await axios.post(ARTICLES_API_URL, data);
        alert("등록 완료");
        navigate(`/article/${res.data.id}`);
      }
    } catch (error) {
      console.error("Save failed:", error);
      alert("저장에 실패했습니다.");
    }
  };

  // 툴바 플러그인
  const ToolbarPlugin = () => {
    const [editor] = useLexicalComposerContext();
    const applyStyle = (style) => {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            // selection.patchStyleText(style);
            $patchStyleText(selection, style);
          }
        });
    };
    const applyBold = () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
    const applyUnderline = () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
    const applyAlign = (alignment) => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignment);

    return (
      <div className="mb-3 d-flex flex-wrap gap-2 align-items-center">
        <Dropdown>
          <Dropdown.Toggle variant="outline-secondary" size="sm" id="font-family-dropdown">글꼴</Dropdown.Toggle>
          <Dropdown.Menu>
            {["나눔고딕", "맑은고딕", "Arial", "Times New Roman"].map((font) => (
              <Dropdown.Item key={font} onClick={() => applyStyle({ 'font-family': font })}>{font}</Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
        <Dropdown>
          <Dropdown.Toggle variant="outline-secondary" size="sm" id="font-size-dropdown">크기</Dropdown.Toggle>
          <Dropdown.Menu>
            {[10, 12, 14, 18, 24].map((size) => (
              <Dropdown.Item key={size} onClick={() => applyStyle({ 'font-size': `${size}pt` })}>{size}pt</Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
        <Button variant="outline-secondary" size="sm" onClick={applyBold}>굵게</Button>
        <Button variant="outline-secondary" size="sm" onClick={applyUnderline}>밑줄</Button>
        <Form.Control type="color" title="글 색상 선택" defaultValue="#000000" onChange={(e) => applyStyle({ color: e.target.value })} style={{ width: "40px", height: "31px" }} />
        <Button variant="outline-primary" size="sm" onClick={() => toolbarFileInputRef.current.click()}>이미지</Button>
        <Form.Control type="file" multiple accept="image/*" onChange={(e) => handleImageUpload(e, editor)} ref={toolbarFileInputRef} className="d-none" />
        <Button variant="outline-secondary" size="sm" onClick={() => applyAlign("left")}>왼쪽</Button>
        <Button variant="outline-secondary" size="sm" onClick={() => applyAlign("center")}>가운데</Button>
        <Button variant="outline-secondary" size="sm" onClick={() => applyAlign("right")}>오른쪽</Button>
      </div>
    );
  };

  const initialConfig = {
    namespace: "Editor",
    theme: {
      text: { bold: "editor-bold", italic: "editor-italic", underline: "editor-underline" },
      paragraph: "editor-paragraph",
    },
    onError(error) { console.error("Lexical Error:", error); },
    editorState: contentRef.current,
    nodes: [HeadingNode, QuoteNode, ImageNode, ListNode, ListItemNode, ParagraphNode],
  };

  return (
    <div className="container py-4">
      <h2>{isEdit ? "작품 내용 수정하기" : "작품 내용 등록하기"}</h2>
      <Form.Group className="mb-3">
        <Form.Control type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목을 입력하세요." />
      </Form.Group>
      {isLoaded ? (
        <LexicalComposer initialConfig={initialConfig}>
          <ToolbarPlugin />
          <div className="editor-shell border rounded mb-3">
            <RichTextPlugin
              contentEditable={<ContentEditable className="editor-content p-3" style={{ minHeight: "300px", outline: "none", resize: "vertical" }} />}
              placeholder={<div className="editor-placeholder">본문을 입력하세요...</div>}
              ErrorBoundary={LexicalErrorBoundary}
            />
          </div>
          <OnChangePlugin onChange={(editorState) => (contentRef.current = JSON.stringify(editorState))} />
          <HistoryPlugin />
          <ListPlugin />
          <ImagePlugin />
        </LexicalComposer>
      ) : (
        <div>에디터를 불러오는 중입니다...</div>
      )}
      
      <Form.Group className="mb-3">
        <Form.Control type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="#태그 입력 후 Enter" onKeyDown={(e) => {if (e.key === "Enter") { e.preventDefault(); handleAddTag();}}}/>
        <div className="mt-2 d-flex flex-wrap gap-2">
          {tags.map((tag, idx) => (
            <Badge key={idx} pill bg="secondary" className="fw-normal">
              {tag} <span role="button" className="ms-1" onClick={() => handleRemoveTag(tag)}>×</span>
            </Badge>
          ))}
        </div>
      </Form.Group>
      
      <div className="mt-4 d-flex justify-content-between align-items-center">
        <Button variant="primary" onClick={handleSave}>{isEdit ? "수정하기" : "등록하기"}</Button>
        {/* 공유 기능 등 추가 버튼 영역 */}
      </div>
    </div>
  );
}

export default ArticleForm;