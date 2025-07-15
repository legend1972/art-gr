import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { Container, Card } from 'react-bootstrap';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:3000/artists';
const ARTWORK_API_URL = 'http://localhost:3000/artworks';
const ARTICLE_API_URL = "http://localhost:3000/articles";

//작품 클릭 시 상세 보기
function ArtworkDetail() {
    const { id } = useParams();
    const [ artwork, setArtwork ] = useState(null);
    const [ artistName, setArtistName ] = useState("");
    const [ article, setArticle ] = useState(null);

    useEffect(() => {
        if (id) {
            // 1. 첫 번째 API를 호출합니다.
            axios.get(`${ARTWORK_API_URL}?id=${id}`)
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

                        return axios.get(`${ARTICLE_API_URL}?artworkId=${id}`);
                    }
                })
                .then(articleRes => {
                    if(articleRes && articleRes.data.length > 0) {
                        setArticle(articleRes.data[0]);
                    }
                })
                .catch(error => {
                    console.error("데이터를 불러오는 중 오류 발생:", error);
                });
        }
    }, [id]);

    if (!artwork && !article) return <p>Loading...</p>;
    if (!artwork) return <p>Artwork not found.</p>;

    return (
        <Container className="py-4">
            <div>
                <small>
                    {article ? (
                        <Link to={`/article/edit/${id}/${article.id}`} className="btn btn-primary mb-3">
                            작품 내용 수정하기
                        </Link>
                    ) : (
                        <Link to={`/article/new`} className="btn btn-primary mb-3">
                            작품 내용 등록하기
                        </Link>
                    )}
                </small>
            </div>
            <Card>
                <Card.Img variant="top" src={artwork.imageUrl} style={{ maxWidth: '400px', height: 'auto', objectFit: 'contain' }} className="mx-auto d-block" />
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