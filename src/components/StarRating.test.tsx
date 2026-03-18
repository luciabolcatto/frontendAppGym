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
});
