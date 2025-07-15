import React from "react";
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Home from "./pages/Home";
import ArtistDetail from "./pages/ArtistDetail";
import ArtworkDetail from "./pages/ArtworkDetail";
import ArtistForm from "./pages/ArtistForm";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import UploadForm from "./pages/UploadForm";
import ArticleDetail from "./pages/ArticleDetail";
import ArticleForm from "./pages/ArticleForm";
import ArticleList from "./pages/ArticleList";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/artist/new" element={<ArtistForm />}/>
          <Route path="/artist/edit/:id" element={<ArtistForm isEdit />}/>
          <Route path="/artist/:id" element={<ArtistDetail />}/>
          <Route path="/artwork/:id" element={<ArtworkDetail />}/>
          <Route path="/artist/upload/:id" element={<UploadForm/>}/>
          <Route path="/article/:id" element={<ArticleDetail/>}/>
          <Route path="/article/edit/:artworkId/:id" element={<ArticleForm isEdit/>}/>
          <Route path="/article/new" element={<ArticleForm />} />
          <Route path="/article/search" element={<ArticleList />} />
          <Route path="*" element={<NotFound />}/>
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;