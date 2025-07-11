import React from "react";
import { ListGroup, Image } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";

const ARTWORK_API_URL = 'http://localhost:3000/artworks';

function ArtistList({ artists, selectedArtist, setSelectedArtist, setArtworks}) {
    const resList = async (artist) => {
        await axios.get(`${ARTWORK_API_URL}?artistId=${artist.id}`).then(res => {
            setArtworks(res.data);
            setSelectedArtist(artist);
        });
    };
    
    return (
        <ListGroup>
            {artists.map((artist) => (
                <ListGroup.Item
                    key={artist.id}
                    action
                    active={selectedArtist && selectedArtist.id === artist.id}
                    onClick={() => resList(artist)}
                >
                    <div className="d-flex align-items-center">
                        <Image src={artist.photo} roundedCircle width={40} className="me-3"/>
                        <div>
                            <strong>
                                <Link to={`/artist/${artist.id}`} className="text-decoration-none">
                                    {artist.name}
                                </Link>
                            </strong><br />
                            <small>{artist.bio}</small>
                        </div>
                    </div>
                </ListGroup.Item>
            ))}
        </ListGroup>
    );
}

export default ArtistList;