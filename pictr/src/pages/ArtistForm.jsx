import React, { useState, useEffect } from "react";
import { Container, Form, Button, Image } from "react-bootstrap";
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:3000/artists';

function ArtistForm({ isEdit = false}) {
    const [artist, setArtist] = useState({name: '', bio: '', country: '', birthYear: '', photo: '', artworks: []});
    const {id} = useParams();
    const navigate = useNavigate();
    const [previewPhoto, setPreviewPhoto] = useState('');

    useEffect(() => {
        if(isEdit && id) {
            axios.get(`${API_URL}?id=${id}`).then(res => {
                // if(res.data.length > 0) setArtist(res.data[0]);
                if(res.data) {
                    setArtist(res.data);
                    setPreviewPhoto(res.data.photo || "");
                }
            });
        }
    }, [isEdit, id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if(isEdit) {
            console.log("isEdit is not null");
            axios.put(`${API_URL}/${artist.id}`, artist).then(() => navigate('/'));
        } else {
            console.log("isEdit is null");
            axios.post(API_URL, artist).then(() => navigate('/'));
        }
    };

    const handlePhotoChange = (e) =>{
        const file = e.target.files[0];
        if(file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => {
                setPreviewPhoto(reader.result);
                setArtist({...artist, photo: reader.result});
            }
            reader.readAsDataURL(file);
        }
    };

    return (
        <Container className="py-4">
            <h3>{isEdit ? 'Edit Artist': 'Add New Artist'}</h3>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label htmlFor="name">이름</Form.Label>
                    <Form.Control type="text" id="name" value={artist.name} onChange={e => setArtist({...artist, name: e.target.value})} required />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label htmlFor="bio">소개</Form.Label>
                    <Form.Control type="textarea" id="bio" value={artist.bio} onChange={e => setArtist({...artist, bio: e.target.value})} />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label htmlFor="country">국가</Form.Label>
                    <Form.Control type="text" id="country" value={artist.country} onChange={e => setArtist({...artist, country: e.target.value})}/>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label htmlFor="birthYear">출생년도</Form.Label>
                    <Form.Control type="number" id="birthYear" value={artist.birthYear} onChange={e => setArtist({...artist, birthYear: e.target.value})}/>
                </Form.Group>
                <Form.Group className="mb-3" controlId="photo">
                    <Form.Label htmlFor="photo">사진 업로드</Form.Label>
                    <Form.Control type="file" id="photo" accept="image/" onChange={handlePhotoChange}/>
                    {previewPhoto && (
                        <Image src={previewPhoto} alt="미리보기" className="mt-3 img-fluid" style={{ maxWidth: '200px'}} rounded/>
                    )}
                </Form.Group>
                <Button type="submit">{isEdit ? "수정" : "등록"}</Button>
            </Form>
        </Container>
    );
}

export default ArtistForm;