// Test query script for verifying Wikimedia Commons API throughput and data structure
const fs = require('fs');

async function testFetch() {
  const query = 'Tokyo night';
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=50&prop=imageinfo&iiprop=url|size|mime|extmetadata&iiurlwidth=600&format=json&origin=*`;
  
  const startTime = Date.now();
  const res = await fetch(url, {
    headers: { 'User-Agent': 'FlocusStudyDashboard/2.0 (contact: support@flocus.app)' }
  });
  const data = await res.json();
  const pages = Object.values(data.query?.pages || {});
  const elapsed = Date.now() - startTime;
  console.log(`Fetched ${pages.length} items in ${elapsed}ms`);
  
  if (pages.length > 0) {
    const first = pages[0];
    const info = first.imageinfo?.[0];
    console.log('Sample item:', {
      pageid: first.pageid,
      title: first.title,
      thumburl: info?.thumburl,
      fullurl: info?.url,
      width: info?.width,
      height: info?.height,
      mime: info?.mime,
      license: info?.extmetadata?.LicenseShortName?.value || 'Public Domain'
    });
  }
}

testFetch();
