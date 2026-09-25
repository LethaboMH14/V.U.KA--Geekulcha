package za.co.vuka.app.ui.onboarding

import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import za.co.vuka.app.R
import kotlinx.coroutines.launch

/**
 * Onboarding step 8 — Invite guardians. The last onboarding step.
 *
 * Invites are SIMULATED (see [InviteGuardianSheet]). Each one shows as a
 * numbered pending invite. The prototype's demo names are not used, because
 * no real person has accepted anything.
 */
class InviteGuardiansFragment : Fragment(R.layout.fragment_invite_guardians) {

    private val onboardingViewModel: OnboardingViewModel by activityViewModels()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        view.findViewById<View>(R.id.btnBack).setOnClickListener {
            findNavController().navigateUp()
        }

        childFragmentManager.setFragmentResultListener(
            InviteGuardianSheet.RESULT_KEY, viewLifecycleOwner
        ) { _, _ -> onboardingViewModel.addPendingInvite() }

        // No PIN prompt here: the PINs were set one step ago, which is the fresh
        // authorisation spec G1 asks for. Invites from Settings later need the PIN.
        view.findViewById<View>(R.id.btnInvite).setOnClickListener {
            InviteGuardianSheet().show(childFragmentManager, "invite_guardian")
        }

        view.findViewById<View>(R.id.btnFinish).setOnClickListener {
            onboardingViewModel.completeRegistration()
            findNavController().navigate(R.id.action_inviteGuardians_to_home)
        }

        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                onboardingViewModel.pendingInvites.collect { renderGuardians(view, it) }
            }
        }
    }

    private fun renderGuardians(view: View, pending: Int) {
        val list = view.findViewById<ViewGroup>(R.id.guardianList)
        list.removeAllViews()
        repeat(pending) { i ->
            val row = layoutInflater.inflate(R.layout.item_guardian_row, list, false)
            row.findViewById<TextView>(R.id.tvName).text = "Invite ${i + 1}"
            list.addView(row)
        }

        val empty = pending == 0
        view.findViewById<View>(R.id.tvEmpty).visibility = if (empty) View.VISIBLE else View.GONE
        list.visibility = if (empty) View.GONE else View.VISIBLE
        view.findViewById<TextView>(R.id.tvCounts).apply {
            visibility = if (empty) View.GONE else View.VISIBLE
            text = "0 accepted · $pending pending"
        }
    }
}
