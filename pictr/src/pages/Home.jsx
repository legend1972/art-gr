import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import axios from 'axios';
import ArtistList from "../components/ArtistList";
import ArtistCard from "../components/ArtistCard";
import ArtworkGallery from "../components/ArtworkGallery";
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:3000/artists';
const ARTWORK_API_URL = 'http://localhost:3000/artworks';

function Home() {
    const [artists, setArtists] = useState([]);
    const [selectedArtist, setSelectedArtist] = useState(null);
    const [artworks, setArtworks] =  useState([]);

    useEffect(() => {
        axios.get(API_URL).then(res => {
            setArtists(res.data);
            if (res.data.length > 0) {
                setSelectedArtist(res.data[0]);
            }
        }).catch(error => {
            console.error("Error fetching artists:", error);
        });
    }, []);

    // 선택된 아티스트 변경 시 작품 목록 가져오기
    useEffect(() => {
        if (selectedArtist) {
            axios.get(`${ARTWORK_API_URL}?artistId=${selectedArtist.id}`)
                .then(res => {
                    setArtworks(res.data);
                })
                .catch(error => {
                    console.error("Error fetching artworks:", error);
                    setArtworks([]); // 에러 시 빈 배열 설정
                });
        }
    }, [selectedArtist]);

    return (
        <Container className="my-4">
            <Row>
                <Col md={4} className="mb-4">
                    <div className="d-flex justify-content-between align-items-center">
                        <h2>Artists</h2>
                        <Link to="/artist/new" className="btn btn-primary btn-sm">Add</Link>
                    </div>
                    <ArtistList artists={artists} selectedArtist={selectedArtist} setSelectedArtist={setSelectedArtist} setArtworks={setArtworks}/>
                </Col>
                <Col md={8}>
                    <ArtistCard artist={selectedArtist}/>
                    {selectedArtist && <ArtworkGallery artworks={artworks} />}
                </Col>
            </Row>
        </Container>
    );
}

export default Home;