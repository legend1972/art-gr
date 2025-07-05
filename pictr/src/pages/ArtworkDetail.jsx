import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { Container, Card } from 'react-bootstrap';
import axios from 'axios';

const API_URL = 'http://localhost:3000/artists';

//작품 클릭 시 상세 보기
function ArtworkDetail() {
    const { id } = useParams();
    const [ artwork, setArtwork ] = useState(null);

    useEffect(() => {
        axios.get(API_URL).then(res => {
            const artworks = res.data.flatMap(a => a.artworks.map(aw => ({...aw, artistName: a.name})));
            const found = artworks.find(a => a.id.toString() === id);
            setArtwork(found);
        });
    }, [id]);

    if(!artwork) return <p>Artwork not found.</p>

    return (
        <Container className="py-4">
            <Card>
                <Card.Img variant="top" src={artwork.imageUrl}/>
                <Card.Body>
                    <Card.Title>{artwork.title}</Card.Title>
                    <Card.Text>{artwork.description}</Card.Text>
                    <p><strong>By: </strong>{artwork.artistName}</p>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default ArtworkDetail;