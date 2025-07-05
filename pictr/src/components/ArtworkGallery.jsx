import React from "react";
import {Row, Col} from 'react-bootstrap';
import ArtworkCard from "./ArtworkCard";

function ArtworkGallery({ artworks }) {
    return (
        <Row>
            {artworks.map((artwork) => (
                <Col xs={12} sm={6} md={3} key={artwork.id} className="mb-4">
                    {<ArtworkCard artwork={artwork} />}
                </Col>
            ))}
        </Row>
    );
}

export default ArtworkGallery;