# flask.py
import os
from flask import Flask, request, jsonify, render_template
from deprem_ai import backend 
from werkzeug.utils import secure_filename 



app = Flask(__name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/process-file', methods=['POST'])
def handle_file():
    if 'file' not in request.files:
        return jsonify({'error': 'Dosya alanı eksik'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'Dosya seçilmedi'}), 400

    if file and allowed_file(file.filename):
        

        try:
            result_text = backend(file)

            if result_text:
                 return jsonify({'result': result_text})
            else:
                 return jsonify({'error': 'Görüntü analizi başarısız oldu.'}), 500

        except Exception as e:
            print(f"Sunucu hatası: {e}")
            return jsonify({'error': f'Sunucu tarafında bir hata oluştu: {type(e).__name__}'}), 500

    else:
         return jsonify({'error': 'Geçersiz dosya türü. İzin verilenler: png, jpg, jpeg, gif'}), 400


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')