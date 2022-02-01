package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/golang-jwt/jwt"
)

const secretKey = "secret-key"

func main() {
	ctx := context.Background()
	if err := run(ctx); err != nil {
		log.Fatal(err)
	}
}

func run(ctx context.Context) error {
	log.Println("start server")
	http.HandleFunc("/claim", claimHandler)
	return http.ListenAndServe(":8080", nil)
}

type claimBody struct {
	Message   string `json:"message"`
	Signature string `json:"signature"`
}

func claimHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Headers", "*")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Content-Type", "application/json")
	if r.Method != http.MethodPost {
		fmt.Fprintf(w, mustErrorResponse("invalid request method"))
		return
	}
	if r.Header.Get("Content-Type") != "application/json" {
		fmt.Fprintf(w, mustErrorResponse("unsupported content type"))
		return
	}

	var payload claimBody
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		log.Println(err)
		fmt.Fprintf(w, mustErrorResponse("failed to decode"))
		return
	}
	pubKey, err := getPubKey(payload)
	if err != nil {
		log.Println(err)
		fmt.Fprintf(w, mustErrorResponse("failed to get public key"))
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"pubKey": pubKey,
	})
	tokenStr, err := token.SignedString([]byte(secretKey))
	if err != nil {
		log.Println(err)
		fmt.Fprintf(w, mustErrorResponse("failed to signed token"))
		return
	}

	b, err := json.Marshal(map[string]interface{}{"jwt": tokenStr})
	if err != nil {
		log.Println(err)
		fmt.Fprintf(w, mustErrorResponse("failed to serialize"))
		return
	}
	fmt.Fprintf(w, string(b))
}

const messagePrefix = "\x19Ethereum Signed Message:\n"

func getPubKey(payload claimBody) (string, error) {
	sig := hexutil.MustDecode(payload.Signature)
	if sig[64] != 27 && sig[64] != 28 {
		return "", fmt.Errorf("invalid signature")
	}
	sig[64] -= 27

	hash := crypto.Keccak256Hash([]byte(messagePrefix), []byte(strconv.Itoa(len(payload.Message))), []byte(payload.Message))
	pubKey, err := crypto.SigToPub(hash.Bytes(), sig)
	if err != nil {
		return "", fmt.Errorf("error: crypto.Ecrecover: %w", err)
	}
	addr := crypto.PubkeyToAddress(*pubKey)

	return addr.String(), nil
}

func mustErrorResponse(msg string) string {
	b, err := json.Marshal(map[string]interface{}{"error": msg})
	if err != nil {
		panic(err)
	}
	return string(b)
}
