import React from "react";
import { Card, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';

//작가 상세 카드 (홈 or 상세 페이지 내)
function ArtistCard({ artist }) {
    if(!artist) return null;

    return (
        <Card className="p-3 mb-4">
            <div className="d-flex align-items-center">
                <Image src={artist.photo} roundedCircle width={80} className="me-4" />
                <div>
                    <h4>
                        <Link to={`/artist/${encodeURIComponent(artist.id)}`} className="text-decoration-none">
                            {artist.name}
                        </Link>
                    </h4>
                    <p className="mb-1">{artist.bio}</p>
                    <small>{artist.country} | {artist.birthYear}</small>
                    <div>
                        <small>
                            <Link to={`/artist/upload/${encodeURIComponent(artist.id)}`} className="text-decoration-none">
                                이미지 업로드
                            </Link>
                        </small>
                    </div>
                </div>
            </div>
        </Card>
    );
}

export default ArtistCard;