import styled from 'styled-components';
import Toast from './Toast';
import { useToast } from '../../hooks/useToast';

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <Container>
      {toasts.map((toast, index) => (
        <ToastWrapper key={toast.id} $index={index}>
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        </ToastWrapper>
      ))}
    </Container>
  );
}

const Container = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  z-index: 10000;
  pointer-events: none;
`;

const ToastWrapper = styled.div<{ $index: number }>`
  position: absolute;
  right: 0;
  top: ${props => 20 + props.$index * 80}px;
  pointer-events: all;
  transition: top 0.3s ease;
`;
