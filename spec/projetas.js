function Projetas() {
  return {
    solve : function(form) {
    	var countErros = 0;
        $.each(form, function(k, v) {
            if(v.required === true && v.value === ''){
                countErros++;
			}
        });

        return countErros;
	}
 }
}
