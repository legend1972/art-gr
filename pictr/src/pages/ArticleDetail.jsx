import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import CommentSection from "../components/CommentSection";

const API_URL = "http://localhost:3000/articles"

function ArticleDetail() {
    //id: Article ID
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    
    useEffect(() => {
        if(id) {
            axios.get(`${API_URL}/${id}`).then(res => setArticle(res.data));
        }
    }, [id]);

    if(!article) return <p>로딩 중...</p>;

    return (
        <div className="container py-4">
            <h2>{article.title}</h2>
            <div dangerouslySetInnerHTML={{__html: article.content}}></div>

            <Link to={`article/edit/${article.id}`} className="btn btn-primary mt-3">수정하기</Link>

            <CommentSection articleId={id}/>
        </div>
    );
}

export default ArticleDetail;