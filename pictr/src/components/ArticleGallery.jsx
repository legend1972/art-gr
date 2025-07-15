import React from "react";
import { Row, Col } from "react-bootstrap";
import ArticleCard from "./ArticleCard";

//기사 리스트
function ArticleGallery({ articles }) {
    return (
        <Row>
            {articles.map(article => (
                <Col xs={12} sm={6} md={3} key={article.id} className="mb-4">
                    <ArticleCard article={article}/>
                </Col>
            ))}
        </Row>
    );
}

export default ArticleGallery;