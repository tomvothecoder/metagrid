import axios from 'axios';

it('returns fallback handler', async () => {
  const result = axios.get('invalid_handler');
  await expect(result).rejects.toThrow('500');
});
