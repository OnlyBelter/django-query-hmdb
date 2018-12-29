import django.forms as forms


class SearchForm(forms.Form):
    search_fields = [('HMDB_ID', 'HMDB_ID'), ('SMILES', 'SMILES')]
    search_field = forms.ChoiceField(choices=search_fields,
                                     initial='HMDB_ID')
    search_value = forms.CharField(widget=forms.Textarea, strip=True, initial='HMDB0000022')
