package com.nyumbadirect.app;

import android.content.Intent;

import androidx.activity.result.ActivityResult;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.tasks.Task;

/**
 * Gets a verifiable Google ID token from Android and returns it to the React app.
 * The token's audience is the existing NyumbaDirect web/server client ID, so the
 * Laravel /auth/google endpoint can validate it without a second login system.
 */
@CapacitorPlugin(name = "NativeGoogleSignIn")
public class NativeGoogleSignInPlugin extends Plugin {
    private GoogleSignInClient googleSignInClient;

    @PluginMethod
    public void signIn(PluginCall call) {
        GoogleSignInOptions options = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestIdToken(getContext().getString(R.string.google_web_client_id))
            .requestEmail()
            .build();

        googleSignInClient = GoogleSignIn.getClient(getContext(), options);
        // Let the account chooser appear, so a user can deliberately select the
        // NyumbaDirect account they want to use.
        googleSignInClient.signOut().addOnCompleteListener(task -> {
            Intent intent = googleSignInClient.getSignInIntent();
            startActivityForResult(call, intent, "handleSignInResult");
        });
    }

    @ActivityCallback
    private void handleSignInResult(PluginCall call, ActivityResult result) {
        if (call == null) return;

        if (result.getResultCode() != android.app.Activity.RESULT_OK || result.getData() == null) {
            call.reject("Google sign-in was cancelled.");
            return;
        }

        Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(result.getData());
        try {
            GoogleSignInAccount account = task.getResult(ApiException.class);
            String idToken = account.getIdToken();
            if (idToken == null || idToken.isEmpty()) {
                call.reject("Google did not return an identity token.");
                return;
            }

            JSObject response = new JSObject();
            response.put("idToken", idToken);
            if (account.getEmail() != null) response.put("email", account.getEmail());
            call.resolve(response);
        } catch (ApiException error) {
            call.reject("Google sign-in failed (code " + error.getStatusCode() + ").", error);
        }
    }
}
