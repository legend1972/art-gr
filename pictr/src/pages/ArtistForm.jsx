import React, { useState, useEffect } from "react";
import { Container, Form, Button, Image } from "react-bootstrap";
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:3000/artists';
const UP_API_URL = "http://localhost:8080/api/upload-image";

function ArtistForm({ isEdit = false}) {
    //artworks: []
    const [artist, setArtist] = useState({name: '', bio: '', country: '', birthYear: '', photo: '' });
    const {id} = useParams();
    const navigate = useNavigate();
    //setPreviewPhoto: 비동기 함수
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
            axios.put(`${API_URL}/${artist.id}`, artist).then(() => navigate('/'));
        } else {
            axios.post(API_URL, artist).then(() => navigate('/'));
        }
    };

    const handlePhotoChange = async (e) =>{
        const selectedFile = e.target.files[0];
        if(!selectedFile) return;

        if(!selectedFile.type.startsWith('image/')) {
            alert("이미지 파일이 아닙니다. 다시 선택해 주세요.");
            return;
        }

        let imageUrl = "";
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const uploadRes = await axios.post(UP_API_URL, formData, {
                headers: { "Content-Type": "multipart/form-data"}
            });

            imageUrl = uploadRes.data.imageUrl;
            setPreviewPhoto(imageUrl);
        } catch (error) {
            alert("파일 업로드에 실패했습니다.");
            setPreviewPhoto("");
        }

        console.log("previewPhoto: ", imageUrl);
        setArtist({...artist, photo: imageUrl});
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
                <Form.Group className="mb-3">
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