function getLangText(what)
{
	var lang = navigator.language;
	var text = [
	'BEST','Your best:\n', 'Su mejor:\n','Haut score:\n','Höchste Punktzahl:\n','Eddigi legjobb:\n',
	'SCORE','RIDE OVER\n\nYour score:\n','RIDE TERMINA\n\nSu punctuacion:\n','FIN DU JEU\n\nVotre score:\n','SPIEL ZU ENDE\n\nDeine Punkte:\n','ÜTKÖZTÉL\n\nPontszámod:\n',
	'INFO','HIGHWAY RUSH\n\nCreated by\nIstvan Szalontai\n2013','AUTOPISTA PRISA\n\nCreado por\nIstvan Szalontai\n2013','AUTOROUTE RUÉE\n\nÉcrit par\nIstvan Szalontai\n2013','AUTOBAHN RAUSCH\n\nErstellt von\nIstvan Szalontai\n2013','AUTÓPÁLYÁN ROHANÁS\n\nKészítette\nSzalontai István\n2013'
	];
	var j = 1;//english is default
	if(lang.search('es') != -1)j = 2;
	if(lang.search('fr') != -1)j = 3;
	if(lang.search('de') != -1)j = 4;
	if(lang.search('hu') != -1)j = 5;
	var i = -1;
	do
		i++;
	while(text[i] != what && i < text.length);
	if(text[i] == what)
	{
		return text[i+j];
	}else
	{
		return 'none';
	}
}
