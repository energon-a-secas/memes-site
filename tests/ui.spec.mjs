import { test, expect } from '@playwright/test';
import { resolve } from 'node:path';

const IMAGE = 'assets/images/anime/avatar-no-war.png';
async function fixture(page, {admin = false, signedIn = true} = {}) {
  await page.addInitScript(({admin, signedIn, image}) => {
    window.fixture = {
      admin, signedIn, calls:[], fail:false,
      memes:JSON.parse(localStorage.getItem('test-memes') || 'null') || [
        {_id:'upload-1',name:'team-reaction',category:'general',labels:['work','reaction'],url:image,ext:'png',ownerSubject:'owner',displayName:'Anon',_creationTime:200},
        {_id:'upload-2',name:'game-night',category:'games',labels:['work'],url:'assets/images/games/la-bestia.jpg',ext:'jpg',ownerSubject:'other',displayName:'Member',_creationTime:100},
      ],
      organization:JSON.parse(localStorage.getItem('test-organization') || 'null') || [{memeKey:'aun-me-queda-el-panda',category:'anime',labels:['reaction']}],
    };
  }, {admin,signedIn,image:IMAGE});
  await page.route('https://esm.sh/convex@1.21.0/browser', route => route.fulfill({contentType:'text/javascript',body:`
    export class ConvexHttpClient {
      async query(name) {
        const f=window.fixture;
        if(name==='memes:list') return f.memes;
        if(name==='memes:organization') return f.organization;
        if(name==='auth:isAdmin') return f.admin;
        if(name==='votes:getVotes') return {counts:[],upvoted:[],downvoted:[]};
        if(name==='categories:list') return [];
      }
      async mutation(name,args) {
        const f=window.fixture;
        f.calls.push({name,args});
        if(f.fail) throw new Error('Simulated offline save');
        if(name==='memes:getUploadUrl') return location.origin+'/fixture-upload';
        if(name==='memes:saveMeme') {
          f.memes.unshift({...args,_id:'new-upload',ownerSubject:'owner',url:'${IMAGE}',_creationTime:300});
        }
        if(name==='memes:organize') {
          const values={category:args.category,labels:args.labels};
          if(args.memeId) f.memes=f.memes.map(m=>m._id===args.memeId?{...m,...values}:m);
          else { f.organization=f.organization.filter(m=>m.memeKey!==args.memeKey);f.organization.push({memeKey:args.memeKey,...values}); }
          localStorage.setItem('test-memes',JSON.stringify(f.memes));
          localStorage.setItem('test-organization',JSON.stringify(f.organization));
          return values;
        }
      }
    }` }));
  await page.route('**/js/neorgon-auth.js', route => route.fulfill({contentType:'text/javascript',body:`
    export const NeoAuth={onChange(fn){this.listener=fn},async start(){this.listener({signedIn:window.fixture.signedIn,label:window.fixture.signedIn?'Tester':null,userId:'owner'})},async requireSignIn(){window.fixture.signInRequested=true;return false}};
  `}));
  await page.route('**/fixture-upload', route => route.fulfill({json:{storageId:'new-storage'}}));
  // Prevent any fixture from reaching production Convex or authentication services.
  await page.route('https://*.convex.cloud/**', route => route.abort());
  await page.goto('/');
  await expect(page.locator('#resultInfo')).toHaveText('88 of 88 memes');
}

async function chooseCategory(page, field, value) {
  await page.locator(field).click();
  const picker = page.locator('dialog.picker[open]');
  await picker.locator('.picker-create-input').fill(value);
  await picker.locator('.picker-create-submit').click();
  await expect(picker).toBeHidden();
}

test('search, labels and categories combine and reset', async ({page}) => {
  await fixture(page);
  await page.locator('#labelFilters').getByRole('button',{name:'reaction'}).click();
  await expect(page.locator('.meme-card')).toHaveCount(2);
  await page.locator('#chips').getByRole('button',{name:'Anime'}).click();
  await expect(page.locator('.meme-card')).toHaveCount(1);
  await page.locator('#searchInput').fill('does not exist');
  await expect(page.getByText('No memes match',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Clear search & filters'}).click();
  await expect(page.locator('.meme-card')).toHaveCount(88);
  await page.locator('#labelFilters').getByRole('button',{name:'work'}).click();
  await page.locator('#labelFilters').getByRole('button',{name:'reaction'}).click();
  await expect(page.locator('.meme-card')).toHaveCount(1);
  await expect(page.locator('#resultInfo')).toContainText('matching all selected labels');
});

test('owner edits category and labels, which survive a reload', async ({page}) => {
  await fixture(page);
  await page.getByRole('button',{name:'Organize Team Reaction',exact:true}).click();
  await expect(page.locator('#organizeForm')).toBeVisible();
  await chooseCategory(page, '#organizeCategory', 'Team Jokes');
  await page.getByRole('button',{name:'Remove label work',exact:true}).click();
  await page.locator('#organizeLabelsInput').fill('#Reaction, office, OFFICE');
  await page.getByRole('button',{name:'Save changes',exact:true}).click();
  await expect(page.locator('#lightboxTaxonomy')).toContainText('Team Jokes');
  await expect(page.locator('#lightboxTaxonomy')).toContainText('office');
  expect(await page.evaluate(()=>window.fixture.calls.at(-1).args)).toMatchObject({memeId:'upload-1',category:'team-jokes',labels:['reaction','office']});
  await page.getByRole('button',{name:'Close',exact:true}).click();
  await page.reload();
  await expect(page.locator('#chips').getByRole('button',{name:'Team Jokes'})).toBeVisible();
  await page.locator('#chips').getByRole('button',{name:'Team Jokes'}).click();
  await expect(page.locator('.meme-card')).toHaveCount(1);
});

test('failed saves preserve edits, then retry; keyboard editing does not navigate', async ({page}) => {
  await fixture(page);
  await page.getByRole('button',{name:'Organize Team Reaction',exact:true}).click();
  await chooseCategory(page, '#organizeCategory', 'Office');
  await page.locator('#organizeCategory').press('ArrowLeft');
  await expect(page.locator('#lightboxName')).toHaveText('Team Reaction');
  await page.locator('#organizeLabelsInput').fill('a'.repeat(33));
  await page.getByRole('button',{name:'Save changes',exact:true}).click();
  await expect(page.locator('#organizeLabelsInputError')).toContainText('32 characters');
  await page.locator('#organizeLabelsInput').fill('inside joke');
  await page.evaluate(()=>window.fixture.fail=true);
  await page.getByRole('button',{name:'Save changes',exact:true}).click();
  await expect(page.locator('#organizeError')).toContainText('Could not save');
  await expect(page.locator('#organizeCategory')).toContainText('Office');
  await expect(page.getByRole('button',{name:'Remove label inside joke'})).toBeVisible();
  await page.evaluate(()=>window.fixture.fail=false);
  await page.getByRole('button',{name:'Save changes',exact:true}).click();
  await expect(page.locator('#organizeForm')).toBeHidden();
});

test('custom metadata renders as text and labels can be removed', async ({page}) => {
  await fixture(page);
  await page.getByRole('button',{name:'Organize Team Reaction',exact:true}).click();
  await chooseCategory(page, '#organizeCategory', '<svg onload=alert(1)>');
  await page.getByRole('button',{name:'Remove label work',exact:true}).click();
  await page.getByRole('button',{name:'Remove label reaction',exact:true}).click();
  await page.locator('#organizeLabelsInput').fill('<img src=x onerror=alert(1)>');
  await page.getByRole('button',{name:'Save changes',exact:true}).click();
  await expect(page.locator('#lightboxTaxonomy img, #lightboxTaxonomy svg')).toHaveCount(0);
  await expect(page.locator('#lightboxTaxonomy')).toContainText('<img src=x onerror=alert(1)>');
});

test('uploads include custom categories and pending labels', async ({page}) => {
  await fixture(page);
  await page.locator('#uploadToggle').click();
  await page.locator('#fileInput').setInputFiles(resolve(IMAGE));
  await page.locator('#memeNameInput').fill('a-new-joke');
  await chooseCategory(page, '#memeCatSelect', 'Office Life');
  await page.locator('#uploadLabelsInput').fill('work, funny');
  await page.locator('#uploadSubmit').click();
  await expect(page.locator('#uploadPreview')).toBeHidden();
  expect(await page.evaluate(()=>window.fixture.calls.find(c=>c.name==='memes:saveMeme').args)).toMatchObject({name:'a-new-joke',category:'office-life',labels:['work','funny'],displayAnonymous:true});
  await expect(page.locator('#resultInfo')).toHaveText('89 of 89 memes');
});

test('admin organizes bundled memes; other owners are read-only', async ({page}) => {
  await fixture(page, {admin:true});
  await page.getByRole('button',{name:'Organize Aun Me Queda El Panda',exact:true}).click();
  await chooseCategory(page, '#organizeCategory', 'Pandas');
  await page.getByRole('button',{name:'Save changes',exact:true}).click();
  await expect(page.locator('#lightboxTaxonomy')).toContainText('Pandas');
  expect(await page.evaluate(()=>window.fixture.calls.at(-1).args.memeId)).toBeUndefined();
  await page.getByRole('button',{name:'Close',exact:true}).click();
  await page.evaluate(async()=>{
    const {state}=await import('/js/state.js');state.isConvexAdmin=false;
  });
  await page.getByRole('button',{name:'Organize Game Night',exact:true}).click();
  await expect(page.locator('#organizeToggle')).toBeDisabled();
});

test('mobile filters, viewer and keyboard focus fit the screen', async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await fixture(page);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('#filterToggle').click();
  await page.locator('#chips').getByRole('button',{name:'Anime'}).click();
  await page.locator('#filterToggle').click();
  await page.locator('.card-organize').first().click();
  await expect(page.locator('#lightbox')).toHaveCSS('opacity','1');
  await expect(page.locator('#lightbox')).toBeVisible();
  await page.evaluate(()=>document.querySelector('#searchInput').focus());
  expect(await page.evaluate(()=>document.querySelector('#lightbox').contains(document.activeElement))).toBe(true);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({path:'test-results/mobile-viewer.png'});
  await page.keyboard.press('Escape');
  await expect(page.locator('#lightbox')).not.toHaveAttribute('open');
});

test('anonymous visitors can browse and see how to organize', async ({page}) => {
  await fixture(page,{signedIn:false});
  await page.getByRole('button',{name:'Organize Team Reaction',exact:true}).click();
  await expect(page.locator('#organizeHint')).toContainText('Sign in');
  await page.locator('#organizeToggle').click();
  expect(await page.evaluate(()=>window.fixture.signInRequested)).toBe(true);
  expect(await page.evaluate(()=>window.fixture.calls.length)).toBe(0);
});

test('Escape closes the category picker while keeping the viewer and draft open', async ({page}) => {
  await fixture(page);
  await page.getByRole('button',{name:'Organize Team Reaction',exact:true}).click();
  await page.locator('#organizeLabelsInput').fill('still editing');
  await page.locator('#organizeCategory').click();
  await expect(page.locator('dialog.picker[open]')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog.picker[open]')).toHaveCount(0);
  await expect(page.locator('#lightbox')).toHaveAttribute('open');
  await expect(page.locator('#organizeLabelsInput')).toHaveValue('still editing');
  await expect(page.locator('#organizeCategory')).toBeFocused();
});
