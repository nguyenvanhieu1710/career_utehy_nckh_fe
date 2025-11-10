import { useRef, ReactNode } from 'react';
import './ui.css';

interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  value?: string;
  height?: number | string;
  onClick?: () => void;
  backgroundColor?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  color?: string;
  border?: string;
  disable?: boolean;
  flex?: number;
}

const Button: React.FC<ButtonProps> = ({
  type = 'button',
  value = '',
  onClick = () => { },
  backgroundColor = '',
  iconLeft = <></>,
  iconRight = <></>,
  height = "40px",
  color,
  border,
  disable = false,
  flex = 1,
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    if (buttonRef.current && !disable) {
      buttonRef.current.click();
    }
  };

  return (
    <div
      className="btn-ui-carrer"
      onClick={handleClick}
      style={{
        height: height || 40,
        opacity: disable ? 0.5 : 1,
        backgroundColor: backgroundColor || '#0C6A4E',
        border: border || '2px solid rgba(255, 255, 255, 1)',
        outline: 'none',
        cursor: disable ? 'not-allowed' : 'pointer',
        borderRadius: '5px',
        color: color || 'rgba(255, 255, 255, 1)',
        fontSize: '13px',
        fontWeight: 510,
        padding: '5px 10px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
        flex: flex,
        justifyContent: 'center',
      }}
    >
      {iconLeft}
      {value}
      {iconRight}
      <button
        type={type}
        ref={buttonRef}
        onClick={onClick}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default Button;
