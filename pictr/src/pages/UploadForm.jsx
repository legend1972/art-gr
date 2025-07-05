import React, {useState, useRef, useEffect} from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import {Container, Card, Form, Button, Alert, Modal, ListGroup, Row, Col} from 'react-bootstrap';
import { MAX_LENGTH } from "../js/common/constants";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../css/CustomDatePicker.css';
import { format } from 'date-fns';
import axios from "axios";
import { useParams } from "react-router-dom";

const API_URL = "http://localhost:3000/artists";

//이미지 파일 업로드
function UploadForm() {
    const [file, setFile] = useState(null); //선택된 파일 객체
    const [title, setTitle] = useState(''); //제목
    const [description, setDescription] = useState(''); //설명
    const [titleofwork, setTitleofwork] = useState(''); //작품명
    const [workYearMonth, setWorkYearMonth] = useState(null); //작품년월
    const [previewUrl, setPreviewUrl] = useState(''); //이미지 미리보기 URL
    const [showModal, setShowModal] = useState(false); //취소 모달 열림/닫힘 상태
    const [hasDraft, setHasDraft] = useState(false); //임시저장된 데이터 존재
    const [uploadedFiles, setUploadedFiles] = useState([]); //업로드된 파일 목록 (JSON 데이터)
    const [showFileList, setShowFileList] = useState(false); //업로드된 파일 목록 보기/숨기기
    const [showDeleteModal, setShowDeleteModal] = useState(false); //파일 삭제 확인 모달
    const [fileToDelete, setFileToDelete] = useState(null); //삭제할 파일 ID
    const [selectedFileId, setSelectedFileId] = useState(null); // 선택된 파일 ID를 추적하기 위한 상태
    const fileInputRef = useRef(null); //파일 입력 필드 참조(Ref for File Input)
    const { id } = useParams();

    console.log("id: ", id);

    //화면 Mount 시 db.json 파일의 uploads 내 리스트를 출력
    //API 호출 시 이미지 등록한 사용자로 조회하도록 변경 필요
    useEffect(() => {
        if(id) {
            axios.get(`${API_URL}/${id}`).then(res => {
                setUploadedFiles(res.data.artworks || []);
            }).catch(error => console.error("error fetch: ", error));
        }
    }, [id]);

    //파일 선택 핸들러
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]; //선택된 첫 번째 파일 가져오기
        if(selectedFile) {
            setFile(selectedFile); //파일 상태 업데이트

            //이미지 파일인 경우
            if(selectedFile.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = () => { //파일 읽기가 완료되면 실행될 콜백 함수
                    setPreviewUrl(reader.result); //미리보기 URL 상태 업데이트 (reader.result: 파일의 내용을 Base64로 인코딩한 클라이언트 측 데이터 URL)
                }

                reader.readAsDataURL(selectedFile);
            } else /* 이미지 파일이 아닌 경우 */ {
                alert("이미지 파일이 아닙니다. 다시 선택해 주세요.");
                setFile(null); //파일 초기화
                return;
            }
        }
    };

    //파일 선택 버튼 클릭 핸들러
    const handleSelectFile = () => {
        fileInputRef.current.click(); //숨겨진 input 요소를 클릭하여 파일 선택 창 열기
    };

    //파일을 끌어다 놓을 때 핸들러
    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0]; //dataTransfer: 드래그 앤 드롭(Drag and Drop) 이벤트를 처리할 때 사용되는 객체
        if (droppedFile) {
            setFile(droppedFile);

            //이미지 파일인 경우
            if(droppedFile.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = () => setPreviewUrl(reader.result);
                reader.readAsDataURL(droppedFile);
            } else /* 이미지 파일이 아닌 경우 */ {
                alert("이미지 파일이 아닙니다. 다시 선택해 주세요.");
                setFile(null); //파일 초기화
                return;
            }
        }
    };

    //파일을 드롭했을 때 브라우저가 파일을 열거나 다운로드하지 않도록 막음.
    const handleDragOver = (e) => {
        e.preventDefault(); // Drop 허용
    };

    //제목 입력 핸들러
    const handleTitleChange = (e) => {
        const input = e.target.value;
        if(input.length <= MAX_LENGTH.MAX_TITLE_LENGTH) {
            setTitle(input); //제목 상태 업데이트
        } else {
            alert(`제목은 ${MAX_LENGTH.MAX_TITLE_LENGTH}자 이내로 입력해주세요.`);
            setTitle(input.slice(0, MAX_LENGTH.MAX_TITLE_LENGTH));
        }
    };

    //설명 입력 핸들러
    const handleDescriptionChange = (e) => {
        const input = e.target.value;
        if(input.length <= MAX_LENGTH.MAX_DESCIPTION_LENGTH) {
            setDescription(input);  //설명 상태 업데이트
        } else {
            alert(`설명은 ${MAX_LENGTH.MAX_DESCIPTION_LENGTH}자 이내로 입력해주세요.`);
            setDescription(input.slice(0, MAX_LENGTH.MAX_DESCIPTION_LENGTH));  //설명 상태 업데이트
        }
    };

    //작품명 입력 핸들러
    const handleTitleofworkChange = (e) => {
        const input = e.target.value;
        if(input.length <= MAX_LENGTH.MAX_TITLE_OF_WORK) {
            setTitleofwork(input);
        } else {
            alert(`작품명은 ${MAX_LENGTH.MAX_TITLE_OF_WORK}자 이내로 입력해주세요.`);
            setTitleofwork(input.slice(0, MAX_LENGTH.MAX_TITLE_OF_WORK)); //작품명 상태 업데이트
        }
    };

    //작품년월 입력 핸들러
    const handleSelectDateChange = (date) => {
        setWorkYearMonth(date ? format(date, 'yyyyMM') : null);
    }

    // 파일 선택 시 폼에 데이터 채우기 (수정 모드)
    const handleEditFile = (file) => {
        setSelectedFileId(file.id); // 수정할 파일 ID 저장
        setTitle(file.title || '');
        setDescription(file.description || '');
        setTitleofwork(file.titleofwork || '');
        setWorkYearMonth(file.workYearMonth || null);
        setPreviewUrl(file.imageUrl || '');
        setFile(null); // 파일은 다시 선택해야 함
        alert('파일 정보를 불러왔습니다. 이미지를 변경하려면 새 파일을 선택하세요.');
    };

    //업로드 핸들러
    const handleUpload = async () => {
        if(!file) {
            alert('파일을 선택해주세요!');
            return;
        }

        if(!title.trim()) {
            alert('제목을 입력해 주세요!');
            return;
        }

        if(!description.trim()) {
            alert('설명을 입력해 주세요!');
            return;
        }

        if(!titleofwork.trim()) {
            alert('작품명을 입력해 주세요!');
            return;
        }

        if(!workYearMonth) {
            alert('작품년월을 입력해 주세요!');
            return;
        }
        
        // //API 개발 시 수정 필요함.
        // const newFileEntry = {
        //     id: selectedFileId || String(Date.now()),
        //     fileName: file ? file.name : uploadedFiles.find(f => f.id === selectedFileId)?.fileName,
        //     title,
        //     description,
        //     titleofwork,
        //     workYearMonth,
        //     imageUrl: previewUrl, //미리보기 URL을 이미지 URL로 저장 (실제는 서버 URL)
        //     uploadDate: new Date().toISOString() //업로드 날짜 기록
        // };
        
        try {
            const response = await axios.get(`${API_URL}/${id}`);
            let imageUrl = previewUrl;

            //API 개발 시 수정 필요함.
            // const url = selectedFileId
            //     ? `${API_URL}?id=${id}/${selectedFileId}`
            //     : `${API_URL}?id=${id}`;
            // const method = selectedFileId ? 'PUT' : 'POST';

            // const response = await axios(url, {
            //     method,
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(newFileEntry),
            // });

            const newFileEntry = {
                id: selectedFileId || String(Date.now()),
                fileName: file ? file.name : uploadedFiles.find(f => f.id === selectedFileId)?.fileName,
                title,
                description,
                titleofwork,
                workYearMonth,
                imageUrl,
                uploadDate: new Date().toISOString()
            };

            const artist = response.data;

            let updatedArtworks;
            //기존 파일 목록에 새 파일 추가. 최근에 올린 이미지를 최상단에 위치 시킴.
            if (selectedFileId) {
                // 기존 파일 업데이트
                updatedArtworks = artist.artworks.map(artwork => artwork.id === selectedFileId ? newFileEntry : artwork);
            } else {
                // 새 파일 추가
                updatedArtworks = [...(artist.artworks || []), newFileEntry];
            }

            await axios.put(`${API_URL}/${id}`, {
                ...artist,
                artworks: updatedArtworks
            });

            setUploadedFiles(updatedArtworks);
            
            //JSON 파일 형태로 로컬 스토리지에 저장
            localStorage.setItem('uploadedFiles', JSON.stringify(updatedArtworks));
            //임시 저장 데이터 삭제
            localStorage.removeItem('uploadDraft');
            setHasDraft(false);

            //폼 초기화
            resetForm();

            // 수정 모드 종료
            setSelectedFileId(null);

            alert(selectedFileId ? '수정 성공' : '업로드 성공');
        } catch (error) {
            console.error('업로드 중 오류 발생: ', error);
        }
    };

    //폼 초기화
    const resetForm = () => {
        setFile(null);
        setTitle('');
        setDescription('');
        setTitleofwork('');
        setPreviewUrl('');
        setWorkYearMonth('');
        setSelectedFileId(null); // 수정 모드 초기화
        if(fileInputRef.current) {
            fileInputRef.current.value = ''; //파일 입력 필드 초기화
        }
    };

    //취소 버튼 핸들러
    const handleCancel = () => {
        //현재 입력된 데이터가 있을 때만 모달을 띄움
        if(file || title || description || titleofwork || workYearMonth) {
            setShowModal(true); // 모달 표시
        } else {
            resetForm(); // 바로 리셋
        }
    };

    //임시 저장 기능
    const handleSaveDraft = () => {
        const draftData = {
            title,
            description,
            titleofwork,
            workYearMonth,
            //파일 객체는 로컬 스토리지에 직접 저장할 수 없음.
            //그래서 미리보기 URL만 저장하고, 파일은 다시 선택하게 해야 함.
            previewUrl,
            lastSaved: new Date().toISOString() //마지막 저장 시간 기록
        };

        localStorage.setItem('uploadDraft', JSON.stringify(draftData)); //JSON 문자열로 변환하여 저장
        setHasDraft(true); //임시 저장 데이터가 있다고 표시
        setShowModal(false); //모달 닫기
        resetForm(); //폼 초기화

        alert('임시저장 되었습니다.!');
    };

    //임시 저장 데이터 불러오기
    const handleLoadDraft = () => {
        const savedDraft = localStorage.getItem('uploadDraft');
        if(savedDraft) {
            const draftData = JSON.parse(savedDraft);

            setTitle(draftData.title || ''); //저장된 제목 불러오기
            setDescription(draftData.description || ''); //저장된 설명 불러오기
            setPreviewUrl(draftData.previewUrl || ''); //저장된 미리보기 URL 불러오기
            setTitleofwork(draftData.titleofwork || ''); //저장된 작품명 불러오기
            setWorkYearMonth(draftData.workYearMonth || ''); //저장된 작품년월 불러오기

            //파일 객체는 로컬 스토리지에 저장되지 않으므로, 사용자에게 다시 선택하도록 안내
            if(draftData.previewUrl) {
                alert('임시저장된 내용을 불러왔습니다.! 파일은 다시 선택해 주세요');
            }

            setHasDraft(false); //임시저장 알림은 삭제
        }
    };

    //계속 수정 버튼 핸들러
    const handleContinueEditing = () => {
        setShowModal(false); //모달 닫고 계속 작업
    };

    //작성 내용 삭제 버튼 핸들러
    const handleDelete = () => {
        resetForm(); //폼 초기화
        setShowModal(false); //모달 닫기
        localStorage.removeItem('uploadDraft'); //임시 저장 데이터 삭제
        setHasDraft(false); //임시 저장 알림은 삭제
        alert('작성 내용이 모두 삭제되었습니다.');
    };

    //파일 목록 토글 핸들러
    const toggleFileList = () => {
        setShowFileList(!showFileList);
    };

    //파일 삭제 확인 모달 열기
    const confirmDeleteFile = (id) => {
        console.log('confirmDeleteFile 호출: ', typeof id);
        setFileToDelete(id); //삭제할 파일의 ID 저장
        setShowDeleteModal(true); //삭제 확인 모달 열기
    };

    //파일 삭제 최종 확인 및 처리
    const handleDeleteConfirmed = async () => {
    try {

        const response = await axios.get(`${API_URL}/${id}`);
        
        if (response.ok) {
            const artist = response.data;
            // artworks 배열에서 항목 제거
            const updatedArtworks = artist.artworks.filter(artwork => artwork.id !== fileToDelete);

            // 아티스트 데이터 업데이트
            await axios.put(`${API_URL}/${id}`, {
                ...artist,
                artworks: updatedArtworks
            });

            setUploadedFiles(updatedArtworks);
            localStorage.setItem('uploadedFiles', JSON.stringify(updatedArtworks)); // 추가
            alert('파일이 삭제되었습니다.');
        }else {
            alert('삭제 실패: 파일을 찾을 수 없습니다.');
        }
    } catch (error) {
        console.error('삭제 중 오류 발생:', error);
        alert('삭제 중 오류 발생');
    } finally {
        setShowDeleteModal(false);
        setFileToDelete(null);
    }
    };

    // yyyyMM 문자열을 Date 객체로 변환
    const parseDate = (dateString) => {
        if (!dateString || dateString.length !== 6) return null;
        const year = parseInt(dateString.slice(0, 4), 10);
        const month = parseInt(dateString.slice(4, 6), 10) - 1; // 월은 0부터 시작
        return new Date(year, month);
    };
    
    return (
      <Container className="py-4">
        <Card className='shadow'>
            <Card.Header className="bg-primary text-white">
                <h2 className="mb-0 text-center">
                    {selectedFileId ? '파일 수정' : '파일 업로드'}
                </h2>
            </Card.Header>
            <Card.Body>
                {hasDraft && (
                    <Alert variant="warning" className="d-flex justify-content-between align-items-center mb-4">
                        <p className="mb-0">임시 저장된 내용이 있습니다.</p>
                        <Button variant="warning" onClick={handleLoadDraft}>불러오기</Button>
                    </Alert>
                )}

                <div className="mb-4">
                    <Form.Control type='file' onChange={handleFileChange} ref={fileInputRef} className="d-none"/>
                    <div className="border border-2 rounded p-5 text-center" onClick={handleSelectFile} style={{cursor: 'pointer', borderStyle: 'dashed'}} onDrop={handleDrop} onDragOver={handleDragOver}>
                        {previewUrl ? (
                            <img src={previewUrl} alt='미리보기' className="img-fluid mb-3" style={{maxHeight: '200px'}}/>
                        ) : (
                            <div>
                                <p className="mb-3">클릭하거나 파일을 끌어다 놓으세요</p>
                                <Button variant="primary">파일 선택</Button>
                            </div>
                        )}
                    </div>
                    {file &&
                    <p className="text-muted mt-2">선택된 파일: {file.name}
                    </p>}
                </div>

                <Form.Group className="mb-3">
                    <Form.Label htmlFor="title">제목</Form.Label>
                    <Form.Control type="text" id="title" value={title} onChange={handleTitleChange} placeholder="제목을 입력하세요."/>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label htmlFor="description">설명</Form.Label>
                    <Form.Control as="textarea"  id="description" value={description} onChange={handleDescriptionChange} placeholder="설명을 입력하세요." rows="4"/>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label htmlFor="titleofwork" className="mb-0 me-2">작품명</Form.Label>
                    <Form.Control
                                type="text"
                                id="titleofwork"
                                value={titleofwork}
                                onChange={handleTitleofworkChange}
                                placeholder="작품명을 입력하세요."
                                className="me-3"
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label htmlFor="datePicker" className="mb-0 me-2">작품년월</Form.Label>
                    <DatePicker
                                selected={parseDate(workYearMonth)}
                                onChange={handleSelectDateChange}
                                dateFormat="yyyy-MM"
                                placeholderText="날짜를 선택하세요"
                                isClearable
                                id="datePicker"
                                className="form-control"
                    />
                </Form.Group>
                <div className="d-flex justify-content-end gap-2 mt-4">
                        {selectedFileId ? (
                            <Button variant="primary" onClick={handleUpload}>수정</Button>
                        ) : (
                            <Button variant="success" onClick={handleUpload}>등록</Button>
                        )}
                        <Button variant="danger" onClick={handleCancel}>취소</Button>
                    </div>
                <hr className="my-4"/>
                <div className="d-grid gap-2">
                    <Button variant="info" onClick={toggleFileList}>
                        {showFileList ? '업로드된 파일 숨기기' : `업로드된 파일 보기 (${uploadedFiles.length} 개)`}
                    </Button>
                </div>

                {showFileList && (
                        <div className="mt-4">
                            {uploadedFiles.length === 0 ? (
                                <Alert variant="info" className="text-center">아직 업로드된 파일이 없습니다.</Alert>
                            ) : (
                                <ListGroup>
                                    {uploadedFiles.map(item => (
                                        <ListGroup.Item
                                            key={item.id}
                                            className="d-flex justify-content-between align-items-center"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleEditFile(item)} // 클릭 시 수정 모드로 전환
                                        >
                                            <div>
                                                <h5 className="mb-1">{item.title}</h5>
                                                <p className="mb-1 text-muted">{item.fileName}</p>
                                                <p className="mb-1 text-muted">{item.description}</p>
                                                <small className="text-muted">{item.titleofwork}</small>
                                                {item.imageUrl && (
                                                    <div className="mt-2">
                                                        <img src={item.imageUrl} alt={item.title} style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '5px' }} />
                                                    </div>
                                                )}
                                            </div>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation(); // 삭제 버튼 클릭 시 수정 모드 방지
                                                    confirmDeleteFile(item.id);
                                                }}
                                            >
                                                삭제
                                            </Button>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )}
                        </div>
                    )}
            </Card.Body>
        </Card>

        <Modal show={showModal} onHide={()=>{
            setShowModal(false)
        }} centered>
            <Modal.Header closeButton>
                <Modal.Title>작성중인 내용이 있어요!</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>어떻게 할까요?</p>
            </Modal.Body>
            <Modal.Footer className="d-flex flex-column">
                <Button variant="warning" className="w-100 mb-2" onClick={handleSaveDraft}>
                    임시저장
                </Button>
                <Button variant="primary" className="w-100 mb-2" onClick={handleContinueEditing}>
                    계속수정
                </Button>
                <Button variant="danger" className="w-100 mb-2" onClick={handleDelete}>
                    삭제
                </Button>
                <Button variant="secondary" className="w-100" onClick={()=>setShowModal(false)}>
                    닫기
                </Button>
            </Modal.Footer>
        </Modal>

        {/* 팝업 모달 (파일 삭제 확인 */}
        <Modal show={showDeleteModal} onHide={()=>setShowDeleteModal(false)} centered>
            <Modal.Header closeButton>
                <Modal.Title>파일 삭제 확인</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>정말로 이 파일을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={()=>setShowDeleteModal(false)}>
                    취소
                </Button>
                <Button variant="danger" onClick={handleDeleteConfirmed}>
                    삭제
                </Button>
            </Modal.Footer>
        </Modal>
      </Container>
    );

}

export default UploadForm;