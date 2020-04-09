import React, { useState } from 'react';
import axios from 'axios';
import cheerio from 'cheerio';
import './App.css';

// ESSE É UM VISUALIZADOR DE LINK 
// FIZ COM BASE https://www.youtube.com/watch?v=p9aWx0QXGZw

const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";

const getPreviewData = (tags) => {
  const result = tags.reduce((previewData, item) => {

    switch (item.tag) {
      case 'og:title':
        previewData.title = item.value;
        break;
      case 'og:url':
        previewData.link = item.value;
        break;
      case 'og:description':
        previewData.description = item.value;
        break;
      case 'og:site_name':
        previewData.site = item.value;
        break;
      case 'og:image':
        previewData.image = item.value;
        break;
      default:
        break;
    }
    return previewData;
  }, {});
  return Promise.resolve(result);
}

const parseHTML = (html) => {
  const $ = cheerio.load(html)
  const meta = [];
  $('head meta').map((i, item) => {
    if (!item.attribs) return null;

    const property = item.attribs.property || null;
    const content = item.attribs.content || null;

    if (!property || !content) return null;
    meta.push({ tag: property, value: content });
    return null;
  });

  return Promise.resolve(meta);

}

const fetchUrl = (url) => {
  return axios(CORS_PROXY + url)
    //vai retornar o html
    .then(response => response.data);
  // .catch(console.log);
}

const getUrl = (text) => {
  if (!text) return null;

  const a = document.createElement('a');
  a.href = text;

  const { protocol, host, pathname, search, hash } = a;

  const url = `${protocol}//${host}${pathname}${search}${hash}`;

  const isSameHost = (host === window.location.host);

  if (isSameHost) return null;

  console.log(url);

  return url;
}

function App() {

  const [previewData, setPreviewData] = useState(null);

  const onBlur = (e) => {
    const url = getUrl(e.target.value);
    if (!url) return null;
    fetchUrl(url)
      .then(parseHTML)
      .then(getPreviewData)
      .then(setPreviewData)
      .then(console.log)
      .catch(console.error);
  }

  // console.log('previewData', previewData);

  return (
    <div className="container">
      <div className="row mt-5">
        <h2 className="mb-5">Digite um Url para saber informações do site escolhido</h2>
        <div className="col-6">
          <div className="form-group">
            <h4>URL </h4>

            <input type="text" className="form-control" placeholder="https://www.exemplo.com.br/" onBlur={onBlur} />
          </div>
        </div>
      </div>
      {previewData && (
        <div className="row">
          <div className="card col-6 pt-3">
            <img className="card-img-top" src="{previewData.image}" width="250" alt="{previewData.title}" />
            <div className="card-body">
              <small>{previewData.site}</small>
              <h5 className="card-title">{previewData.title}</h5>
              <p>{previewData.description}</p>
              <a href="{previewData.link}" target="_blank" className="btn btn-primary">leia mais</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
