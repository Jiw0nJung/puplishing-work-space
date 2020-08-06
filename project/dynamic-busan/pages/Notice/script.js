import { createElement, wrapping } from '../../src/js/util/dom';
import Router from '../../src/js/module/RouterWithCB';
import ListBoard from '../../src/js/layout/ListBoard';
import TextPost, { contentParser } from '../../src/js/layout/TextPost';
import PageSlider from '../../src/js/layout/PageSlider';
import { emptyAlarmImage } from '../../src/js/component/Image';
import { moreRight } from '../../src/js/component/Icon';

import data from './data.json';
import './style.css';

let noticeData = data;

const DOCUMENT_TITLE = '이용약관';
const DOCUMENT_DETAIL_TITLE = '공지사항 상세내용';
const EMPTY_PAGE_TEXT = '아직 등록된 공지사항이 없습니다.';

// Callback으로 동작하는 라우터를 생성합니다.
const router = new Router();

/**
 * @description 공지사항이 없을 시 빈 페이지를 생성합니다.
 * @returns {HTMLElement} 빈 화면 Element
 */
function createEmptyPage() {
  // Component Element를 생성합니다.
  const image = emptyAlarmImage();
  const text = createElement('div', {
    class: 'font-text-body1 font-color-light empty-page-text',
    child: EMPTY_PAGE_TEXT,
  });

  return wrapping('empty-page', [image, text]);
}

/**
 * @description Json 데이터를 기반으로 공지사항 리스트 페이지를 생성합니다.
 * @param {{title: string, date: string, content: string[], from: string}[]} data 공지사항 데이터 리스트
 * @param {(index: number) => voide} nextPageFunc 다음 페이지로 이동하는 함수
 * @returns {HTMLElement} List Board Page
 */
function createListBoardPage(nextPageFunc) {
  // List의 내부를 구성 Element를 만듭니다.
  const itemList = data.reduce((prev, cur) => {
    const { title, date } = cur;
    const titleElement = createElement('p', {
      class: 'font-text-body1 font-medium font-color-dark',
      child: title,
    });
    const dateElement = createElement('p', {
      class: 'font-number-body3 font-color-regular',
      child: date,
    });
    const textWrapper = createElement('div', {
      class: 'header-custom-text',
      child: [titleElement, dateElement],
    });
    const container = createElement('div', {
      class: 'header-custom-content row',
      child: [textWrapper, moreRight(16, '#E5E5E5')],
    });
    return prev.concat(container);
  }, []);

  // List Board Paga를 반환합니다.
  return new ListBoard('notice-board', itemList, nextPageFunc).element;
}

/**
 * @description Window Onload Callback
 */
if (window) {
  window.onload = function () {
    // Page를 Render할 Element를 가져옵니다.
    const root = document.getElementsByClassName('root')[0];

    // 데이터가 없을 시 비어있는 페이지를 보여줍니다.
    if (noticeData.length < 1) {
      root.appendChild(createEmptyPage());
      return;
    }

    // PageSlider를 생성합니다.
    const pageSlider = new PageSlider('notice-slider');
    const textPost = new TextPost();

    // 라우터에 함수를 추가합니다.
    router.setRouterFunc('detail', ({ query }) => {
      // Path가 Detail로 시작하면 상세 페이지를 보여줍니다.
      const index = query.index || 0;
      textPost.title = noticeData[index].title;
      textPost.subtitle = noticeData[index].date;
      textPost.contents = noticeData[index].contents;
      textPost.footer = noticeData[index].from;
      document.title = DOCUMENT_DETAIL_TITLE;
      pageSlider.movePage(1);
    });
    router.setRouterFunc('default', () => {
      // Path가 Detail이 아니면 리스트 페이지를 보여줍니다.
      document.title = DOCUMENT_TITLE;
      pageSlider.movePage(0);
    });

    /**
     * @description 리스트 클릭시 상세페이지로 이동하는 함수입니다.
     * @param {number} index 리스트에서 선택한 항목의 인덱스 값
     */
    const nextPageFunc = (index) => router.redirect('/detail', { index });

    // Page Slider에 리스트 페이지와 상세 페이지를 추가합니다.
    pageSlider.addPage(createListBoardPage(nextPageFunc));
    pageSlider.addPage(textPost.element);
    root.appendChild(pageSlider.element);

    // 공지사항 데이터 Contents를 파싱합니다.
    noticeData = noticeData.map((notice) => ({
      ...notice,
      contents: contentParser({ contents: notice.contents }),
    }));
  };
}
