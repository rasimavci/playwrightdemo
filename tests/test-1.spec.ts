import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://posternity.ai/');
  await page.getByRole('navigation').locator('div').nth(1).click();
  await page.getByRole('link', { name: ' Launch Scene Builder' }).click();
  await page.getByRole('textbox', { name: 'e.g., \'a journey through a' }).click();
  await page.getByRole('textbox', { name: 'e.g., \'a journey through a' }).fill('forest journey');
  await page.getByRole('button', { name: ' Generate Scenes' }).click();
 
  await page.getByRole('link', { name: 'Get started free' }).click();await page.goto('https://posternity.ai/');
  await page.getByRole('link', { name: ' Sign In' }).click();
  await page.goto('https://posternity.ai/sign-in');

  /*
  const page1Promise = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'imgSign in with Google' }).click();
  
  const page1 = await page1Promise;
  await page1.goto('https://accounts.google.com/v3/signin/identifier?opparams=%253Fcontext_uri%253Dhttps%25253A%25252F%25252Fposternity.ai&dsh=S-215670209%3A1764614440068997&client_id=74948371715-1apfng8400lkn10vh67nlcepbapkvuu5.apps.googleusercontent.com&o2v=1&redirect_uri=https%3A%2F%2Fposternity-8a363.firebaseapp.com%2F__%2Fauth%2Fhandler&response_type=code&scope=openid+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+profile&service=lso&state=AMbdmDmB1wtNZ9Grt8R-KqxhmAZ7TCOv592UkJRtH_YX-tX7tmcXCVy-1sfcpY_oF0NEvSrb98vl0cYFWcUU9TXzUXGVF678jV-qlQFrOc0Vjwy6Xw0H85RBhr8eKhT-ao0cp-QCuhqLbH1SiJUDIDuemum2nM5Z_vl8B_VFHuTqwLslpp_cUNlbO-TrWdbjbomHi-tQ2_lG6K9zNrzk_GGP9wpj8vVtreF6wQ4P6RfIW-nNsfg9JJkZ9XHXnyG15O3LlhcpQyLVWjnWkPtnQuSmxyR2Sml7gb283ZHqNwV8Nr7eG-2NiPVGlupORD2Ysr1rMhFsGCwMTwA&flowName=GeneralOAuthFlow&continue=https%3A%2F%2Faccounts.google.com%2Fsignin%2Foauth%2Fconsent%3Fauthuser%3Dunknown%26part%3DAJi8hAOiPfJQ4PRd6iGZqUgaraiKgVGP9uHjvb7RqZhSNfqKuCxEiOiyL5urUGRdSG-X7IF6xTP_R5ciRpa7Y1ogsyrjxceTwpu4zkm7mzp8nESMS36yTx1QkTDXgX9ZonUEwvlLMj0W0N5VClVwLW3YhgFVwV3jBW_wDbduOHdxHpjsht4rmbTeTnYceuQ44bCFimGmtY2ZqIdbRSNffaoJ0JAjI6VtK0q-RuDjuuIKEQkPGyboLfhxLGGKSU95TUBQDxBxMJ3QpK9Can9qSBkO-W2vd2WAe--qZwWHf0UkxCqiwBY0VirJQ90r5oxgKubo93M2-UWib-O2Nr--M2A7wdvTqYL_nbbQVwNvlCMcdj-_AwCgoIF1uIkja0-5rss5KmabUTF0Tq-w6b6xdgTsWx07blQn6F8sRhnvaMCwLPxj5ezRtR-wALbrUJHch2GuIUjiAIxYMNyfyI9gsY5TqgF-ZriTdrte42x62jViGmLKd7Xbxug%26flowName%3DGeneralOAuthFlow%26as%3DS-215670209%253A1764614440068997%26client_id%3D74948371715-1apfng8400lkn10vh67nlcepbapkvuu5.apps.googleusercontent.com%26requestPath%3D%252Fsignin%252Foauth%252Fconsent%23&app_domain=https%3A%2F%2Fposternity-8a363.firebaseapp.com&rart=ANgoxcdzhNGyPSXQQQeLc_4rPxkZEv1AqA8OiKgxfPb29JXtYqZ-3E8MK-lGz_5J5cWLM8GoRnftn5U4i63MnZwNhKLldCuQCnLHkUE66CujowvPA1RqZuQ');
  await page1.getByRole('textbox', { name: 'E-posta veya telefon' }).fill('rasim.avci@gmail.com');
  await page1.getByRole('button', { name: 'Sonraki' }).click();
  */
}); 

test('test ai-video', async ({ page }) => {
await page.goto('https://posternity.ai/');
await page.getByRole('link', { name: ' AI Video' }).click();
await page.getByRole('link', { name: 'Learn About' }).click();
await expect(page.getByRole('heading', { name: 'Historic Echoes' })).toBeVisible();
await page.getByRole('link', { name: ' Start Your Story' }).click();
});