"""Official Cardmarket public downloadable price guide, game 18 (One Piece).
For a private, non-commercial personal collector's dashboard.
Run by Github Actions Monday. No scraping, API keys or user data.
"""
from urllib.request import Request, urlopen
from datetime import datetime, timezone
import json, re, pathlib
URLS={
  'products':'https://downloads.s3.cardmarket.com/productCatalog/productList/products_singles_18.json',
  'prices':'https://downloads.s3.cardmarket.com/productCatalog/priceGuide/price_guide_18.json',
}
code=re.compile(r'\b(?:OP|EB|PRB|ST)\d{2}-\d{3}\b',re.I)
def download(url):
    req=Request(url,headers={'User-Agent':'OnePieceCollectionPersonal/1.0'})
    with urlopen(req,timeout=110) as f: return json.load(f)
def rows(obj,*keys):
    if isinstance(obj,list):return obj
    for key in keys:
        if isinstance(obj.get(key),list):return obj[key]
    raise ValueError('Schema JSON public non reconnu, téléchargement stoppé sans effacer les anciens cours')
prod=download(URLS['products']);price=download(URLS['prices'])
products=[]
for p in rows(prod,'products','productList','items','data'):
    nm=p.get('name','')
    if isinstance(nm,dict): nm=nm.get('1',nm.get('en',''))
    if not isinstance(nm,str) or not code.search(nm):continue
    products.append({'idProduct':p.get('idProduct'),'name':nm,'idExpansion':p.get('idExpansion')})
price_rows=[]
for p in rows(price,'priceGuides','priceGuide','prices','items','data'):
    if p.get('idProduct') is None:continue
    price_rows.append({k:p.get(k) for k in ('idProduct','trend','low','avg','avg7','avg30')})
allowed={str(p['idProduct']) for p in products}
price_rows=[p for p in price_rows if str(p['idProduct']) in allowed]
if len(products)<100 or len(price_rows)<100:raise ValueError('Données insuffisantes, fichier précédent conservé')
out={'observed_at':datetime.now(timezone.utc).isoformat(),'source':'Cardmarket public download — price guide game 18','products':products,'priceGuides':price_rows,'createdAt':price.get('createdAt')}
path=pathlib.Path(__file__).resolve().parent.parent/'prix_cardmarket.json'
path.write_text(json.dumps(out,ensure_ascii=False,separators=(',',':')),encoding='utf8')
print(f'{len(products)} produits, {len(price_rows)} cotations, {path.stat().st_size} bytes')
