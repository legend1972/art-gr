import React from "react";
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

//작품 카드 하나
//as={Link}: React-Bootstrap 컴포넌트를 React Router의 <Link>로 렌더링하겠다는 의미
//variant="top": Card.Img에서 이미지가 카드의 상단에 배치되도록 지정하는 역할
//text-decoration-none: Bootstrap 유틸리티 클래스로, 텍스트에 밑줄(underline) 등 장식이 보이지 않도록 제거하는 역할
function ArtworkCard({ artwork }) {
    return (
        // 나중에 완료되면 풀어야 함.
        <Card as={Link} to={`/artwork/${artwork.id}`} className="text-decoration-none text-dark">
            <Card.Img variant="top" src={artwork.imageUrl}/>
            <Card.Body>
                <Card.Title>{artwork.title}</Card.Title>
                <Card.Text>{artwork.description}</Card.Text>
            </Card.Body>
        </Card>
    );
}

export default ArtworkCard;