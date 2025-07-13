import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { Container, Card } from 'react-bootstrap';
import axios from 'axios';

const API_URL = 'http://localhost:3000/artists';
const ARTWOKR_API_URL = 'http://localhost:3000/artworks';

//작품 클릭 시 상세 보기
function ArtworkDetail() {
    const { id } = useParams();
    const [ artwork, setArtwork ] = useState(null);
    const [ artistName, setArtistName ] = useState("");

    useEffect(() => {
        if (id) {
            // 1. 첫 번째 API를 호출합니다.
            axios.get(`${ARTWOKR_API_URL}?id=${id}`)
                .then(artworkRes => {
                    // 2. 첫 번째 응답이 성공적으로 오면 이 블록이 실행됩니다.
                    if (artworkRes.data.length > 0) {
                        const currentArtwork = artworkRes.data[0];
                        setArtwork(currentArtwork);

                        // 3. 첫 번째 응답 데이터를 사용하여 두 번째 API를 호출합니다.
                        return axios.get(`${API_URL}?id=${currentArtwork.artistId}`);
                    }
                })
                .then(artistRes => {
                    // 4. 두 번째 응답이 성공적으로 오면 이 블록이 실행됩니다.
                    if (artistRes && artistRes.data.length > 0) {
                        setArtistName(artistRes.data[0].name);
                    }
                })
                .catch(error => {
                    console.error("데이터를 불러오는 중 오류 발생:", error);
                });
        }
    }, [id]);

    if(!artwork) return <p>Artwork not found.</p>

    return (
        <Container className="py-4">
            <Card>
                <Card.Img variant="top" src={artwork.imageUrl}/>
                <Card.Body>
                    <Card.Title>{artwork.title}</Card.Title>
                    <Card.Text>{artwork.description}</Card.Text>
                    <p><strong>By: </strong>{artistName}</p>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default ArtworkDetail;