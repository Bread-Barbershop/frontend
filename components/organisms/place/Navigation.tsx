import { fetchNavigation } from '@/app/api/place/navigation';
import { Button } from '@/components/atoms/button';

function Navigation({
  slat,
  slng,
  sname,
  dlat,
  dlng,
  dname,
}: {
  slat: number;
  slng: number;
  sname: string;
  dlat: number;
  dlng: number;
  dname: string;
}) {
  const handleNavigation = async () => {
    const result = await fetchNavigation(slat, slng, sname, dlat, dlng, dname);
    console.log(result);
  };

  return <Button onClick={handleNavigation}>길 안내</Button>;
}
export default Navigation;
