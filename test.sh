
rm -rf .next node_modules/.cache 
echo "Cleaning up..."   

npm run lint
npx tsc --noEmit
npm run build
npm run dev