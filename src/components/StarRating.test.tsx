import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import StarRating from './StarRating';

describe('StarRating', () => {
  it('renderiza 5 estrellas y marca las llenas segun value', () => {
    render(<StarRating value={3} />);

    const star1 = screen.getByRole('button', { name: '1 estrellas' });
    const star2 = screen.getByRole('button', { name: '2 estrellas' });
    const star3 = screen.getByRole('button', { name: '3 estrellas' });
    const star4 = screen.getByRole('button', { name: '4 estrellas' });
    const star5 = screen.getByRole('button', { name: '5 estrellas' });

    expect(star1).toHaveTextContent('⭐');
    expect(star2).toHaveTextContent('⭐');
    expect(star3).toHaveTextContent('⭐');
    expect(star4).toHaveTextContent('☆');
    expect(star5).toHaveTextContent('☆');
  });

  it('llama onChange al hacer click cuando no es readOnly', () => {
    const onChange = jest.fn();
    render(<StarRating value={1} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: '4 estrellas' }));

    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('no llama onChange cuando es readOnly', () => {
    const onChange = jest.fn();
    render(<StarRating value={4} onChange={onChange} readOnly />);

    const star2 = screen.getByRole('button', { name: '2 estrellas' });
    expect(star2).toBeDisabled();

    fireEvent.click(star2);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('permite click sin onChange sin romper', () => {
    render(<StarRating value={2} />);

    expect(() => {
      fireEvent.click(screen.getByRole('button', { name: '5 estrellas' }));
    }).not.toThrow();
  });

  it('aplica size al fontSize de las estrellas', () => {
    render(<StarRating value={1} size={30} />);

    const star = screen.getByRole('button', { name: '1 estrellas' });
    expect(star).toHaveStyle({ fontSize: '30px' });
  });

  it('renderiza todas las estrellas vacias cuando value es 0', () => {
    render(<StarRating value={0} />);

    screen.getAllByRole('button').forEach((star) => {
      expect(star).toHaveTextContent('☆');
    });
  });

  it('renderiza todas las estrellas llenas cuando value es 5', () => {
    render(<StarRating value={5} />);

    screen.getAllByRole('button').forEach((star) => {
      expect(star).toHaveTextContent('⭐');
    });
  });

  it('cambia el estado visual al hacer click en diferente estrella', () => {
    const onChange = jest.fn();
    render(<StarRating value={2} onChange={onChange} />);

    // Inicialmente: 2 llenas, 3 vacías
    expect(screen.getByRole('button', { name: '2 estrellas' })).toHaveTextContent('⭐');
    expect(screen.getByRole('button', { name: '3 estrellas' })).toHaveTextContent('☆');

    // Click en 4ta estrella
    fireEvent.click(screen.getByRole('button', { name: '4 estrellas' }));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('permite clicks consecutivos y llama onChange cada vez', () => {
    const onChange = jest.fn();
    render(<StarRating value={1} onChange={onChange} />);

    // Primer click
    fireEvent.click(screen.getByRole('button', { name: '3 estrellas' }));
    expect(onChange).toHaveBeenCalledWith(3);
    expect(onChange).toHaveBeenCalledTimes(1);

    // Segundo click
    fireEvent.click(screen.getByRole('button', { name: '5 estrellas' }));
    expect(onChange).toHaveBeenCalledWith(5);
    expect(onChange).toHaveBeenCalledTimes(2);

    // Tercer click (en la misma)
    fireEvent.click(screen.getByRole('button', { name: '5 estrellas' }));
    expect(onChange).toHaveBeenCalledWith(5);
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it('responde correctamente a cambios de prop value', () => {
    const { rerender } = render(<StarRating value={2} />);

    expect(screen.getByRole('button', { name: '2 estrellas' })).toHaveTextContent('⭐');
    expect(screen.getByRole('button', { name: '3 estrellas' })).toHaveTextContent('☆');

    // Rerender con valor diferente
    rerender(<StarRating value={4} />);

    expect(screen.getByRole('button', { name: '4 estrellas' })).toHaveTextContent('⭐');
    expect(screen.getByRole('button', { name: '5 estrellas' })).toHaveTextContent('☆');
  });

  it('no rompe al pasar valores fuera de rango', () => {
    const { rerender } = render(<StarRating value={-1} />);
    expect(() => screen.getAllByRole('button')).not.toThrow();

    rerender(<StarRating value={10} />);
    expect(() => screen.getAllByRole('button')).not.toThrow();
  });

  it('desactiva interacción completa cuando readOnly cambia a true', () => {
    const onChange = jest.fn();
    const { rerender } = render(<StarRating value={2} onChange={onChange} readOnly={false} />);

    fireEvent.click(screen.getByRole('button', { name: '4 estrellas' }));
    expect(onChange).toHaveBeenCalledTimes(1);

    rerender(<StarRating value={2} onChange={onChange} readOnly={true} />);

    fireEvent.click(screen.getByRole('button', { name: '3 estrellas' }));
    expect(onChange).toHaveBeenCalledTimes(1); // No aumenta
  });

  it('mantiene tamaño consistente en todos los clicks', () => {
    const { rerender } = render(<StarRating value={1} size={20} />);

    let stars = screen.getAllByRole('button');
    stars.forEach((star) => {
      expect(star).toHaveStyle({ fontSize: '20px' });
    });

    fireEvent.click(screen.getByRole('button', { name: '5 estrellas' }));

    stars = screen.getAllByRole('button');
    stars.forEach((star) => {
      expect(star).toHaveStyle({ fontSize: '20px' });
    });
  });

  it('valida que cada estrella tiene ariaLabel único', () => {
    render(<StarRating value={3} />);

    for (let i = 1; i <= 5; i++) {
      const button = screen.getByRole('button', { name: `${i} estrellas` });
      expect(button).toHaveAttribute('aria-label', `${i} estrellas`);
    }
  });

  it('permite reset a 0 estrellas con click en primera estrella siendo readOnly', () => {
    const onChange = jest.fn();
    const { rerender } = render(<StarRating value={5} onChange={onChange} readOnly={false} />);

    // Todos los botones son interactivos
    const buttons = screen.getAllByRole('button');
    buttons.forEach((btn) => {
      expect(btn).not.toBeDisabled();
    });

    rerender(<StarRating value={5} onChange={onChange} readOnly={true} />);

    // Todos se deshabilitan
    const disabledButtons = screen.getAllByRole('button');
    disabledButtons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });
});
