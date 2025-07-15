import React from "react";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";

//기사 카드 하나
function ArticleCard({ article }) {
    return (
        <Card as={Link} to={`/article/${article.id}`} className="text-decoration-none">
            <Card.Img src={article.images[0].url}></Card.Img>
            <Card.Body>
                <Card.Title>{article.title}</Card.Title>
            </Card.Body>
        </Card>
    );
}

export default ArticleCard;