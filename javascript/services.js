var anecdote;
var nom;
var points;
var photo;
var chemin = "DecisionTree";
var question;
var nbEspece;

function miseAJourPointsRangAlbum() {
	var id = localStorage.getItem("id");
	firebase.database().ref("Utilisateurs/" + localStorage.getItem("mail")).once('value', function(snapshot) {
		var Score = snapshot.val().Score + points;
		firebase.database().ref("Utilisateurs").child(localStorage.getItem("mail")).child("Score").set(Score);
		firebase.database().ref("Utilisateurs").child(localStorage.getItem("mail")).child("NombreEspeces").set((snapshot.val().NombreEspeces+1));
		firebase.database().ref("ListeRangs").once('value', function(snapshot) {
			var trouve = 0;
			var i =0;
			while (!trouve && i<snapshot.val().length-1)  {
				console.log("i : " + i);
				if ( snapshot.val()[i].Score <= Score && Score < snapshot.val()[i+1].Score ) {
					trouve = 1;
					firebase.database().ref("Utilisateurs").child(localStorage.getItem("mail")).child("Rang").set(snapshot.val()[i].Nom);
				}
				i++;
			}
			if (!trouve &&  i===snapshot.val().length-1 && snapshot.val()[i].Score <= Score) {
				firebase.database().ref("Utilisateurs").child(localStorage.getItem("mail")).child("Rang").set(snapshot.val()[i].Nom);
			}
		})
		
	})
	firebase.database().ref("Utilisateurs").child(localStorage.getItem("mail")).child("Album").once('value', function(snapshot) {
		var taille = snapshot.val().length-1;
		console.log(taille);
		firebase.database().ref("Utilisateurs").child(localStorage.getItem("mail")).child("Album").child(taille).child("ID").set(parseInt(id, 10));
	})
}

function ecrireInfos() {
    document.getElementById("image").innerHTML = "<img class=\"image-centree\" src=\" " + photo + "\"/>"; 
    document.getElementById("points").innerHTML = points + " points"; 
    document.getElementById("espece").innerHTML = nom; 
    document.getElementById("anecdote").innerHTML = anecdote; 
    miseAJourPointsRangAlbum();
   }

function resultatInit() {
	firebase.database().ref("ListeAnimaux/"+localStorage.getItem("id")).on('value', function(snapshot) {
		anecdote = snapshot.val().Anecdote;
		nom  = snapshot.val().Nom;
		points = snapshot.val().Points;
		photo = snapshot.val().Image;
		points = parseInt(points, 10);
		if (points == 0) {
			console.log("espece inconnue");
			miseAJourPointsRangAlbum();
		} else {
			console.log("trouveeee");
			ecrireInfos();
		}
	});
}

function getInformations() {
	if (chemin === "DecisionTree") {
		firebase.database().ref(chemin).child("Question").on('value', function(snapshot) {
		question = snapshot.val();
		ecrireQuestion();
					
		});
	} else {
		firebase.database().ref(chemin).on('value', function(snapshot) {
			if (!snapshot.val().Question)
			{	
				localStorage.setItem("id", snapshot.val().ID);
				if (snapshot.val().ID === 0) {
					document.location.href = "Inconnue.html";
					sendMail();
					//localStorage.setItem("chemin", chemin);
					
				} else {	
				
					document.location.href = "Comparaison.html";	
				}	
			} else {
				question = snapshot.val().Question;
				ecrireQuestion();
			}
		});
	}
}		
function questionValidee (bouton) {
	if (chemin === "DecisionTree") {
		document.getElementById("retourArriere").style.visibility = "visible";
	}
	var valeur = bouton.value;
	chemin += ('/' + valeur);
	getInformations();
}

function questionRetour () {
	chemin = chemin.substring(0, chemin.length-2);
	if (chemin === "DecisionTree") {
		document.getElementById("retourArriere").style.visibility = "hidden";
	}
	getInformations();
}
		
function ecrireQuestion() {
	document.getElementById("question").innerHTML = question; 
}

function afficherImageRef() {

		firebase.database().ref("ListeAnimaux/"+localStorage.getItem("id")).on('value', function(snapshot) {
			document.getElementById("imageRef").innerHTML = "<img class=\"image-centree\" src = \" " +snapshot.val().Image + "\"/> "; 
					
		});
	
}

function ecrireRang() {
	localStorage.setItem("mail", "mail@example_dot_com"); // a deplacer
	firebase.database().ref("Utilisateurs/" + localStorage.getItem("mail") + "/Rang").on('value', function(snapshot) {
		document.getElementById("rang").append(snapshot.val());
	})
	
}
function ecrireScore() {
	firebase.database().ref("Utilisateurs/" + localStorage.getItem("mail") + "/Score").on('value', function(snapshot) {
		document.getElementById("points").append(snapshot.val());
	})
	
}

/*function detectFiles(event) {
	console.log("detect !");
	console.log(event.target.files[0]);
    this.onUploadFile(event.target.files[0]);
 }*/

/*function onUploadFile(file) {
	uploadFile(file).then(
	 (url) => {
		 firebase.database().ref("Utilisateurs/" + localStorage.getItem("mail").child("Album").on('value', function(snapshot) {
		  		firebase.database().ref("Utilisateurs").child(localStorage.getItem("mail")).child("Album").update({snapshot.length : {"Image" : url}});
		  }
		);
	}
}*/
	
/*function uploadFile(file) {
    return new Promise(
      (resolve, reject) => {
        const almostUniqueFileName = Date.now().toString();
        const upload = firebase.storage().ref()
          .child('images/' + almostUniqueFileName + file.name).put(file);
        upload.on(firebase.storage.TaskEvent.STATE_CHANGED,
          () => {
            console.log('Chargement…');
          },
          (error) => {
            console.log('Erreur de chargement ! : ' + error);
            reject();
          },
          () => {
            resolve(firebase.storage().ref()
              .child('images/' + almostUniqueFileName + file.name).getDownloadURL());
              
          }
        );
      }
    );
  }*/
  
function televerserImage(dataURL) {
		const nomUnique = Date.now().toString();
		tacheTeleversement = firebase.storage().ref('/images').child(nomUnique).putString(dataURL, 'data_url', {contentType:'image/png'});  
        tacheTeleversement.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
        function(snapshot) {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
                switch (snapshot.state) {
                    case firebase.storage.TaskState.PAUSED: // or 'paused'
                        console.log('Upload is paused');
                        break;
                	case firebase.storage.TaskState.RUNNING: // or 'running'
                        console.log('Upload is running');
                        break;
                }
        }, function(error) {
                alert("error : " + error);
        }, function() {
			tacheTeleversement.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                localStorage.setItem("urlImage", downloadURL);
                firebase.database().ref("Utilisateurs/" + localStorage.getItem("mail")).child("Album").once('value', function(snapshot) {
                	var index = snapshot.val().length;
		  			firebase.database().ref("Utilisateurs").child(localStorage.getItem("mail")).child("Album").update({[index]: {"Image": downloadURL}});
		        	window.location.href='Question.html';
		  		});

			});

		  });
                
}  

function afficherImage() {
	document.getElementById("photoPrise").src = localStorage.getItem("urlImage");
}

function remplirAlbum() {
 	firebase.database().ref("Utilisateurs/" + localStorage.getItem("mail")).child("Album").once('value', function(snapshot) {
 		var innerHTML = " ";
 		var i = 0;
		for (i; i< snapshot.val().length; i++) {
			if (i%4 == 0) {
				innerHTML+= "<div class=\"row mb-1 mx-1\">";
			}
			
			IDAnimal = snapshot.val()[i].ID
			 innerHTML += "<div id=\"" + IDAnimal + "\" onclick=\"accederPageDetails(" + IDAnimal + ") \" class=\"col conteneur-carre col-sm-3\"><img src=\" " + snapshot.val()[i].Image + "\"class=\"miniature w-100\"/></div>";
			 if (i%4 == 3) { 
			  innerHTML += "</div>";
			 }
			
		 }
		  document.getElementById("album").innerHTML = innerHTML;
		  			 
		  			
	});			
}

function accederPageDetails(IDAnimal) {
	localStorage.setItem("IDAnimal", IDAnimal);
	window.location.href="Details.html"; 
}

function obtenirDetails() {
	firebase.database().ref("ListeAnimaux/"+localStorage.getItem("IDAnimal")).on('value', function(snapshot) {
		document.getElementById("nom-espece").innerHTML = snapshot.val().Nom; 
		document.getElementById("image-espece").innerHTML = "<img class=\"image-centree\" src=\" " + snapshot.val().Image + "\"/>"; 
		document.getElementById("anecdote").innerHTML = "Anecdote : " + snapshot.val().Anecdote;; 
		//document.getElementById("date-trouvaille").innerHTML = snapshot.val().Date;; 
	})
}

function afficherNbEspeces() {
	firebase.database().ref("Utilisateurs/" + localStorage.getItem("mail")).child("NombreEspeces").once('value', function(snapshot) {
		document.getElementById("nbEspece").innerHTML = snapshot.val();
		nbEspece =  snapshot.val();
		firebase.database().ref("ListeAnimaux").once('value', function(snapshot) {
			var nbEspeceRestant = snapshot.val().length - 1 - nbEspece;
			document.getElementById("nbEspeceRestant").innerHTML = nbEspeceRestant;
		
		})
		
	})
}

function afficherBadge() {
	firebase.database().ref("Utilisateurs/" + localStorage.getItem("mail")).child("Rang").once('value', function(snapshot) {
		var rang = snapshot.val();
		console.log("rang ! " + rang);
		firebase.database().ref("ListeRangs").once('value', function(snapshot) {
			for (var i =0; i<snapshot.val().length; i++) {
			console.log("rang : "+ rang + ", tableau : " + snapshot.val()[i].Nom);
				if (snapshot.val()[i].Nom == rang) {
					console.log("trouve");
					document.getElementById("badge").src = snapshot.val()[i].Badge;
					break;
				}
			}
	
		})
	})
}

function afficherDerniereDecouverte() {
	firebase.database().ref("Utilisateurs/" + localStorage.getItem("mail")).child("Album").once('value', function(snapshot) {
		document.getElementById("image-derniere-espece").src = snapshot.val()[(snapshot.val().length-1)].Image;
		var id = snapshot.val()[(snapshot.val().length-1)].ID;
		firebase.database().ref("ListeAnimaux").once('value', function(snapshot) {
			document.getElementById("nom-derniere-espece").innerHTML = snapshot.val()[id].Nom;
		})
	})
		
}



		
		



