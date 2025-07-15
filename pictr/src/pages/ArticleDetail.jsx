import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import CommentSection from "../components/CommentSection";

// --- Lexical 관련 컴포넌트 임포트 ---
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { ParagraphNode } from "lexical";
import { ImageNode } from "../js/ImageNode";

// --- 스타일링을 위해 CSS 임포트 ---
import "../css/Editor.css";

const API_URL = "http://localhost:3000/articles";
const BASE_URL = "http://localhost:8080"; // 이미지 경로를 위해 추가

function ArticleDetail() {
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    
    useEffect(() => {
        if(id) {
            axios.get(`${API_URL}/${id}`).then(res => setArticle(res.data));
        }
    }, [id]);

    if(!article) return <p>로딩 중...</p>;

    // 읽기 전용 에디터의 초기 설정을 정의합니다.
    const initialConfig = {
        namespace: "ArticleDetailViewer",
        // editable: false가 핵심입니다.
        editable: false,
        theme: {
            text: {
                bold: "editor-bold",
                italic: "editor-italic",
                underline: "editor-underline",
            },
            paragraph: "editor-paragraph",
        },
        // ArticleForm에서 사용한 모든 노드를 포함해야 합니다.
        nodes: [HeadingNode, QuoteNode, ImageNode, ListNode, ListItemNode, ParagraphNode],
        // 저장된 JSON 데이터를 editorState로 설정합니다.
        editorState: article.content,
        onError(error) {
            console.error("Lexical read-only error:", error);
        },
    };
    
    // 이미지 경로를 절대 경로로 변환하는 함수 (필요시)
    // 저장된 content의 이미지 src를 절대 경로로 바꿔주는 로직
    // 이렇게 하면 서버 주소가 바뀌어도 이미지가 깨지지 않습니다.
    const transformImagePaths = (config) => {
        const state = JSON.parse(config.editorState);
        const transformNode = (node) => {
            if (node.type === 'image' && node.src.startsWith('/uploads/')) {
                node.src = `${BASE_URL}${node.src}`;
            }
            if (node.children) {
                node.children.forEach(transformNode);
            }
        };
        state.root.children.forEach(transformNode);
        return { ...config, editorState: JSON.stringify(state) };
    };
    
    const finalConfig = transformImagePaths(initialConfig);

    return (
        <div className="container py-4">
            <h2 className="mb-4">제목: {article.title}</h2>
            {/* --- 읽기 전용 Lexical 에디터로 내용 표시 --- */}
            <div className="article-content-wrapper">
                <LexicalComposer initialConfig={finalConfig}>
                    <RichTextPlugin
                        contentEditable={<ContentEditable />}
                        placeholder={null} // 읽기 전용이므로 플레이스홀더 필요 없음
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                </LexicalComposer>
            </div>

            <Link to={`/article/edit/${article.artworkId}/${encodeURIComponent(id)}`} className="btn btn-primary mt-3">수정하기</Link>

            <hr className="my-4" />

            <CommentSection articleId={id}/>
        </div>
    );
}

export default ArticleDetail;