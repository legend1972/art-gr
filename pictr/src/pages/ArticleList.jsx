import React, { useEffect, useState } from "react";
import { Row, Col, Container, Form, Button, InputGroup } from "react-bootstrap";
import ArticleGallery from "../components/ArticleGallery";
import axios from "axios";

const ARTICLES_API_URL = "http://localhost:3000/articles";

function ArticleList() {
    const [articles, setArticles] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        axios.get(ARTICLES_API_URL).then((res) => {
            setArticles(res.data);
        }).catch(error => {
            console.error("Error fetching artists:", error);
        });
    }, []);

    const filteredArticles = articles.filter((article) =>
        //some 메서드는 배열의 요소 중 하나라도 주어진 조건(콜백 함수)을 만족하는지 테스트하는 배열 메서드
        //Array.prototype.some()은 배열을 순회하며 콜백 함수가 true를 반환하는 첫 번째 요소를 찾으면 즉시 true를 반환하고, 모든 요소가 조건을 만족하지 않으면 false를 반환
        Object.values(article).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleSearch = (e) => {
        e.preventDefault();
    };

    return (
        <Container className="my-4">
            <Row>
                <Col md={4}>
                    <h2>작품 검색</h2>
                    <Form onSubmit={handleSearch}>
                        <InputGroup className="mb-3">
                            <Form.Control
                                type="text"
                                placeholder="검색어를 입력하세요."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Button variant="primary" type="submit">
                                검색
                            </Button>
                        </InputGroup>
                    </Form>
                </Col>
                <Col md={8}>
                    {filteredArticles && <ArticleGallery articles={filteredArticles}/>}
                </Col>
            </Row>
        </Container>
    );
}

export default ArticleList;