import React, {useEffect, useState} from "react";
import { useParams } from 'react-router-dom';
import { Container, Card, Row, Col, Image } from 'react-bootstrap';
import axios from 'axios';
import ArtworkGallery from "../components/ArtworkGallery";

const API_URL = 'http://localhost:3000/artists';
const ARTWORK_API_URL = 'http://localhost:3000/artworks';

function ArtistDetail() {
    const { id } = useParams();
    const [ artist, setArtist ] = useState(null);
    const [ artworks, setArtworks] = useState([]);
    
    useEffect(() => {
        axios.get(`${API_URL}?id=${id}`)
        .then(res => {
            if(res.data.length > 0) setArtist(res.data[0]);
        });

        axios.get(`${ARTWORK_API_URL}?artistId=${id}`)
        .then(res => {
            if(res.data.length > 0) setArtworks(res.data);
        });
    }, [id]);

    if(!artist) return <p>Loading artist info...</p>;

    return (
        <Container className="py-4">
            <Card className="p-4">
                <Row>
                    <Col md={4} className="text-center">
                        <Image src={artist.photo} roundedCircle width={120} className="mb-3" />
                        <h4>{artist.name}</h4>
                        <small>{artist.country} | {artist.birthYear}</small>
                    </Col>
                    <Col md={8}>
                        <h5>About The Artist</h5>
                        <p>{artist.bio}</p>
                        <hr/>
                        <h5>Featured Artworks</h5>
                        <ArtworkGallery artworks={artworks}/>
                    </Col>
                </Row>
            </Card>
        </Container>
    );
}

export default ArtistDetail;

