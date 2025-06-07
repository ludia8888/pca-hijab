import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// MSW 서버 설정
export const server = setupServer(...handlers);

// 서버 시작 및 종료를 위한 헬퍼
export const startServer = () => {
  server.listen({ onUnhandledRequest: 'error' });
};

export const stopServer = () => {
  server.close();
};

export const resetHandlers = () => {
  server.resetHandlers();
};