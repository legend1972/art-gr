import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import axios from 'axios';
import ArtistList from "../components/ArtistList";
import ArtistCard from "../components/ArtistCard";
import ArtworkGallery from "../components/ArtworkGallery";
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:3000/artists';

function Home() {
    const [artists, setArtist] = useState([]);
    const [selectedArtist, setSelectedArtist] = useState(null);

    useEffect(() => {
        axios.get(API_URL).then(res => {
            setArtist(res.data);
            setSelectedArtist(res.data[0]);
        });
    }, []);

    return (
        <Container className="my-4">
            <Row>
                <Col md={4} className="mb-4">
                    <div className="d-flex justify-content-between align-items-center">
                        <h2>Artists</h2>
                        <Link to="/artist/new" className="btn btn-primary btn-sm">Add</Link>
                    </div>
                    <ArtistList artists={artists} selectedArtist={selectedArtist} setSelectedArtist={setSelectedArtist}/>
                </Col>
                <Col md={8}>
                    <ArtistCard artist={selectedArtist}/>
                    {selectedArtist && <ArtworkGallery artworks={selectedArtist.artworks} />}
                </Col>
            </Row>
        </Container>
    );
}

export default Home;