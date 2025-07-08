import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import CommentSection from "../components/CommentSection";

const API_URL = "http://localhost:3000/articles"

function ArticleDetail() {
    //artworkId: 작품ID
    const { artworkId } = useParams();
    const [article, setArticle] = useState(null);
    
    useEffect(() => {
        axios.get(`${API_URL}?artworkId=${artworkId}`).then(res => setArticle(res.data));
    }, [artworkId]);

    if(!article) return <p>로딩 중...</p>;

    return (
        <div className="container py-4">
            <h2>{article.title}</h2>
            <div dangerouslySetInnerHTML={{__html: article.content}}></div>

            <Link to={`/edit/${article.id}`} className="btn btn-primary mt-3">수정하기</Link>

            <CommentSection artworkId={parseInt(artworkId)}/>
        </div>
    );
}

export default ArticleDetail;