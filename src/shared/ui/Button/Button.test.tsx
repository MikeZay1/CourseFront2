import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/shared/ui/Button/Button';

describe('Button', () => {
  it('renders children and reacts to click', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Сохранить</Button>);
    await user.click(screen.getByRole('button', { name: 'Сохранить' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
